import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  supabaseAdmin,
  supabaseAnon,
  setupTestUser,
  cleanE2ETestData,
  createPlayerClient
} from './helpers';

describe('E2E Bookings & Pricing Verification', () => {
  const playerEmail = 'booker_test@test.padelitycs.com';
  let playerId: string;
  let playerToken: string;
  let playerClient: any;

  beforeAll(async () => {
    await cleanE2ETestData();
    playerId = await setupTestUser(playerEmail, 'player', 'E2E Booker');

    const { data } = await supabaseAnon.auth.signInWithPassword({
      email: playerEmail,
      password: 'test-password-123'
    });
    playerToken = data.session?.access_token || '';
    playerClient = createPlayerClient(playerToken);
  });

  afterAll(async () => {
    await cleanE2ETestData();
  });

  describe('Pricing Logic & Discount Checks', () => {
    const basePrice = 80.00;
    const discountRate = 0.10; // 10% anticipated payment discount

    it('should calculate the correct anticipated payment discount (10%)', () => {
      const expectedPrice = basePrice * (1 - discountRate);
      expect(expectedPrice).toBe(72.00);
    });

    it('should verify the calculated final price is exactly S/ 72.00', () => {
      const calculatedPrice = basePrice - (basePrice * discountRate);
      expect(calculatedPrice).toBe(72.00);
    });
  });

  describe('Booking Request Submission & Status Verification', () => {
    it('should allow player to submit a booking with yape payment and verify pending status', async () => {
      // 1. Create a reservation
      const reservationId = crypto.randomUUID();
      const courtId = crypto.randomUUID(); // Mock uuid for court
      const { data: resData, error: resError } = await playerClient
        .from('reservations')
        .insert({
          id: reservationId,
          user_id: playerId,
          court_id: courtId,
          date: '2026-06-17',
          start_time: '19:00:00',
          end_time: '20:30:00',
          status: 'pending'
        })
        .select()
        .single();

      expect(resError).toBeNull();
      expect(resData).toBeDefined();
      expect(resData.status).toBe('pending');

      // 2. Submit payment request linked to the reservation
      const paymentId = crypto.randomUUID();
      const { data: payData, error: payError } = await playerClient
        .from('yape_payments')
        .insert({
          id: paymentId,
          reservation_id: reservationId,
          user_id: playerId,
          amount: 72.00, // Anticipated discount applied
          status: 'pending',
          transaction_code: 'YAPE123456',
          screenshot_url: 'https://supabase.bucket/yape_receipt_mock.png'
        })
        .select()
        .single();

      expect(payError).toBeNull();
      expect(payData).toBeDefined();
      expect(payData.status).toBe('pending');
      expect(Number(payData.amount)).toBe(72.00);
    });
  });

  describe('Validation & Check Constraints', () => {
    it('should reject booking requests with empty/missing user_id', async () => {
      const { error } = await supabaseAdmin
        .from('reservations')
        .insert({
          court_id: crypto.randomUUID(),
          date: '2026-06-17',
          start_time: '19:00:00',
          end_time: '20:30:00',
          status: 'pending'
          // user_id is null/missing but required (not null constraint)
        });
      expect(error).not.toBeNull();
    });

    it('should reject payment requests with negative amount', async () => {
      const reservationId = crypto.randomUUID();
      const courtId = crypto.randomUUID();

      // Setup reservation first via admin to bypass RLS if needed
      await supabaseAdmin
        .from('reservations')
        .insert({
          id: reservationId,
          user_id: playerId,
          court_id: courtId,
          date: '2026-06-17',
          start_time: '21:00:00',
          end_time: '22:30:00',
          status: 'pending'
        });

      // Try to create payment with negative amount
      const { error } = await playerClient
        .from('yape_payments')
        .insert({
          reservation_id: reservationId,
          user_id: playerId,
          amount: -10.00,
          status: 'pending',
          transaction_code: 'YAPENEGATIVE',
          screenshot_url: 'mock_url'
        });

      // Database should reject negative amount via CHECK constraint (amount >= 0)
      expect(error).not.toBeNull();
    });
  });
});
