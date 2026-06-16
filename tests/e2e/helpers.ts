import { createClient } from '@supabase/supabase-js';

// Default to local Supabase Docker instance values
export const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2plY3QtcmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY3MTMwMDAsImV4cCI6MjAyMjI4OTAwMH0.anon-key-placeholder';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2plY3QtcmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNjcxMzAwMCwiZXhwIjoyMDIyMjg5MDAwfQ.service-role-placeholder';

// Admin client bypasses RLS using the service_role key
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Anon client represents a public guest or authenticated user (via JWT header)
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Creates a client authenticated under a specific JWT/token.
 */
export function createPlayerClient(accessToken?: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: accessToken ? {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    } : undefined
  });
}

/**
 * Clean up all E2E test data by deleting users and their dependent tables.
 * We identify E2E test users by the email domain '@test.padelitycs.com'.
 */
export async function cleanE2ETestData() {
  try {
    // 1. Get all E2E users
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .like('email', '%@test.padelitycs.com');

    if (usersError || !usersData || usersData.length === 0) {
      return;
    }

    const userIds = usersData.map(u => u.id);

    // 2. Delete dependent records
    // Delete yape payments and reservations using cascading or explicit deletes
    await supabaseAdmin.from('yape_payments').delete().in('user_id', userIds);
    await supabaseAdmin.from('reservations').delete().in('user_id', userIds);
    await supabaseAdmin.from('coupons').delete().in('user_id', userIds);

    // 3. Delete from auth.users (triggers profile deletion if cascade is set, or delete manually)
    for (const userId of userIds) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
  } catch (err) {
    console.warn('E2E cleanup failed, probably because Supabase is not running or tables are not created:', err);
  }
}

/**
 * Setup a test user with a specific profile role, email, and password.
 */
export async function setupTestUser(email: string, role: 'player' | 'admin', fullName: string, phone: string = '999999999') {
  // Check if user already exists
  const { data: existingUser } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) {
    return existingUser.id;
  }

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: 'test-password-123',
    email_confirm: true
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create test user auth: ${authError?.message}`);
  }

  const userId = authData.user.id;

  // Insert profile info
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
      role,
      phone,
      points: 0,
      completed_reservations_count: 0,
      level: 'bronce'
    });

  if (profileError) {
    // Attempt cleanup if profile insertion failed
    await supabaseAdmin.auth.admin.deleteUser(userId);
    throw new Error(`Failed to insert test profile: ${profileError.message}`);
  }

  return userId;
}
