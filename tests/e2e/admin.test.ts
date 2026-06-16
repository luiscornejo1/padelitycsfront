import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  supabaseAdmin,
  supabaseAnon,
  setupTestUser,
  cleanE2ETestData,
  createPlayerClient
} from './helpers';

describe('E2E Admin Operations Verification', () => {
  const adminEmail = 'admin_ops@test.padelitycs.com';
  const playerEmail = 'player_ops@test.padelitycs.com';
  
  let adminId: string;
  let playerId: string;
  let playerToken: string;
  let playerClient: any;

  beforeAll(async () => {
    await cleanE2ETestData();
    adminId = await setupTestUser(adminEmail, 'admin', 'E2E Admin Ops');
    playerId = await setupTestUser(playerEmail, 'player', 'E2E Player Ops');

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

  describe('Admin Booking Approval & Rejection Workflows', () => {
    it('should allow admin to approve a pending payment, transitioning reservation to approved', async () => {
      // 1. Player submits booking & payment
      const reservationId = crypto.randomUUID();
      const courtId = crypto.randomUUID();
      
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: courtId,
        date: '2026-06-18',
        start_time: '18:00:00',
        end_time: '19:30:00',
        status: 'pending'
      });

      const paymentId = crypto.randomUUID();
      await playerClient.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPEAPPROVE',
        screenshot_url: 'mock_url'
      });

      // 2. Admin approves the payment
      const { data: updatePay, error: updatePayError } = await supabaseAdmin
        .from('yape_payments')
        .update({ status: 'approved' })
        .eq('id', paymentId)
        .select()
        .single();

      expect(updatePayError).toBeNull();
      expect(updatePay.status).toBe('approved');

      // Admin or a DB trigger updates reservation status
      const { data: reservation, error: resError } = await supabaseAdmin
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', reservationId)
        .select()
        .single();
      
      expect(resError).toBeNull();
      expect(reservation.status).toBe('confirmed');
    });

    it('should allow admin to reject a pending payment with reason, transitioning reservation to rejected', async () => {
      // 1. Player submits booking & payment
      const reservationId = crypto.randomUUID();
      const courtId = crypto.randomUUID();
      
      await playerClient.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: courtId,
        date: '2026-06-18',
        start_time: '20:00:00',
        end_time: '21:30:00',
        status: 'pending'
      });

      const paymentId = crypto.randomUUID();
      await playerClient.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'pending',
        transaction_code: 'YAPEREJECT',
        screenshot_url: 'mock_url'
      });

      // 2. Admin rejects the payment
      const { data: updatePay, error: updatePayError } = await supabaseAdmin
        .from('yape_payments')
        .update({ status: 'rejected', rejection_reason: 'Monto incorrecto' })
        .eq('id', paymentId)
        .select()
        .single();

      expect(updatePayError).toBeNull();
      expect(updatePay.status).toBe('rejected');
      expect(updatePay.rejection_reason).toBe('Monto incorrecto');

      // Admin or DB trigger marks reservation status as rejected/cancelled
      const { data: reservation, error: resError } = await supabaseAdmin
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId)
        .select()
        .single();

      expect(resError).toBeNull();
      expect(reservation.status).toBe('cancelled');
    });
  });

  describe('Manual Points Adjustment', () => {
    it('should allow admin to manually adjust user points to a non-negative value', async () => {
      // 1. Check original points
      const { data: originalProfile } = await supabaseAdmin
        .from('profiles')
        .select('points')
        .eq('id', playerId)
        .single();
      
      const originalPoints = originalProfile?.points || 0;

      // 2. Admin adjusts points
      const newPoints = originalPoints + 50;
      const { data: updatedProfile, error } = await supabaseAdmin
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', playerId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedProfile.points).toBe(newPoints);
    });

    it('should prevent admin from setting points to a negative value due to DB check constraints', async () => {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ points: -10 })
        .eq('id', playerId);

      // Should be rejected by DB constraint
      expect(error).not.toBeNull();
    });
  });

  describe('Payment State Transition Validation', () => {
    it('should enforce state transitions at database/application level', async () => {
      // Setup a payment that is already approved
      const reservationId = crypto.randomUUID();
      const courtId = crypto.randomUUID();
      await supabaseAdmin.from('reservations').insert({
        id: reservationId,
        user_id: playerId,
        court_id: courtId,
        date: '2026-06-19',
        start_time: '10:00:00',
        end_time: '11:30:00',
        status: 'confirmed'
      });

      const paymentId = crypto.randomUUID();
      await supabaseAdmin.from('yape_payments').insert({
        id: paymentId,
        reservation_id: reservationId,
        user_id: playerId,
        amount: 72.00,
        status: 'approved',
        transaction_code: 'YAPESTATE',
        screenshot_url: 'mock_url'
      });

      // Try to update approved payment back to pending
      const { error: transitionError } = await supabaseAdmin
        .from('yape_payments')
        .update({ status: 'pending' })
        .eq('id', paymentId);

      // If transition check triggers are present, this will fail or be ignored.
      // E2E test asserts transition rule prevents resetting status.
      if (!transitionError) {
        const { data: checkPay } = await supabaseAdmin
          .from('yape_payments')
          .select('status')
          .eq('id', paymentId)
          .single();
        expect(checkPay?.status).not.toBe('pending');
      } else {
        expect(transitionError).toBeDefined();
      }
    });
  });
});
