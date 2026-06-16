import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  supabaseAdmin,
  supabaseAnon,
  setupTestUser,
  cleanE2ETestData,
  createPlayerClient
} from './helpers';

describe('E2E Auth & RLS Verification', () => {
  const adminEmail = 'admin_test@test.padelitycs.com';
  const player1Email = 'player1_test@test.padelitycs.com';
  const player2Email = 'player2_test@test.padelitycs.com';
  
  let adminId: string;
  let player1Id: string;
  let player2Id: string;
  
  let player1Token: string;
  let player2Token: string;

  beforeAll(async () => {
    // Ensure cleanup of previous runs
    await cleanE2ETestData();

    // Create test accounts
    adminId = await setupTestUser(adminEmail, 'admin', 'E2E Admin');
    player1Id = await setupTestUser(player1Email, 'player', 'E2E Player 1');
    player2Id = await setupTestUser(player2Email, 'player', 'E2E Player 2');

    // Authenticate and get tokens
    const { data: p1Auth } = await supabaseAnon.auth.signInWithPassword({
      email: player1Email,
      password: 'test-password-123'
    });
    player1Token = p1Auth.session?.access_token || '';

    const { data: p2Auth } = await supabaseAnon.auth.signInWithPassword({
      email: player2Email,
      password: 'test-password-123'
    });
    player2Token = p2Auth.session?.access_token || '';
  });

  afterAll(async () => {
    await cleanE2ETestData();
  });

  describe('Email Login Validation', () => {
    it('should successfully log in with valid admin credentials', async () => {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: adminEmail,
        password: 'test-password-123'
      });
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(adminEmail);
    });

    it('should successfully log in with valid player credentials', async () => {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: player1Email,
        password: 'test-password-123'
      });
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(player1Email);
    });

    it('should reject login attempts with invalid password', async () => {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: player1Email,
        password: 'wrong-password'
      });
      expect(error).not.toBeNull();
      expect(data.user).toBeNull();
    });

    it('should reject login attempts for non-existent accounts', async () => {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: 'ghost_test@test.padelitycs.com',
        password: 'any-password'
      });
      expect(error).not.toBeNull();
      expect(data.user).toBeNull();
    });
  });

  describe('Role Routing & Profile Checks', () => {
    it('should verify admin user has the admin role in database', async () => {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', adminId)
        .single();
      expect(error).toBeNull();
      expect(data?.role).toBe('admin');
    });

    it('should verify player user has the player role in database', async () => {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', player1Id)
        .single();
      expect(error).toBeNull();
      expect(data?.role).toBe('player');
    });
  });

  describe('Row Level Security (RLS) Verification', () => {
    it('should prevent guest (unauthenticated) users from reading profiles', async () => {
      const { data, error } = await supabaseAnon
        .from('profiles')
        .select('*');
      
      // Guest should either receive a permission error or get 0 rows back depending on RLS setup
      if (error) {
        expect(error.code).toBe('42501'); // Postgres Insufficient Privilege
      } else {
        expect(data).toHaveLength(0);
      }
    });

    it('should prevent standard players from modifying other users profiles', async () => {
      const player1Client = createPlayerClient(player1Token);
      
      // Try to update Player 2's name
      const { data, error } = await player1Client
        .from('profiles')
        .update({ full_name: 'P1 Hack' })
        .eq('id', player2Id)
        .select();

      // RLS should block or return 0 records updated
      if (error) {
        expect(error.code).toBe('42501');
      } else {
        expect(data).toHaveLength(0);
      }
    });

    it('should prevent standard players from updating their own points balance arbitrarily', async () => {
      const player1Client = createPlayerClient(player1Token);

      // Try to increase points to 1000
      const { data, error } = await player1Client
        .from('profiles')
        .update({ points: 1000 })
        .eq('id', player1Id)
        .select();

      // RLS or Database Triggers should block or ignore points column updates by player
      if (error) {
        expect(error.code).toBe('42501');
      } else {
        // Even if the query runs, the points should not have changed if using a trigger or column RLS
        const { data: verifyData } = await supabaseAdmin
          .from('profiles')
          .select('points')
          .eq('id', player1Id)
          .single();
        expect(verifyData?.points).not.toBe(1000);
      }
    });

    it('should prevent standard players from modifying their own role to admin', async () => {
      const player1Client = createPlayerClient(player1Token);

      // Try to update role to admin
      const { data, error } = await player1Client
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', player1Id)
        .select();

      if (error) {
        expect(error.code).toBe('42501');
      } else {
        // Verify role was not changed
        const { data: verifyData } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', player1Id)
          .single();
        expect(verifyData?.role).not.toBe('admin');
      }
    });
  });
});
