export interface PadelCashCoupon {
  code: string;
  value: number; // Valor de descuento, ej. 50 (soles)
  type: 'discount' | 'credit_virtual' | 'free_court';
  isUsed: boolean;
  dateCreated: string;
}

export type PadelUserLevel = 'bronce' | 'plata' | 'oro';

export interface PadelCashUser {
  id: string;
  name: string;
  phone: string;
  points: number;
  completedReservationsCount: number; // Historial acumulativo permanente
  level: PadelUserLevel;
  coupons: PadelCashCoupon[];
}

export interface YapeBookingDetails {
  court: string;
  date: string;
  time: string;
  originalPrice: number;
  discountedPrice: number;
}

export type YapePaymentStatus = 'pending' | 'approved' | 'rejected';

export interface YapePaymentRequest {
  id: string;
  userId: string;
  userName: string;
  bookingDetails: YapeBookingDetails;
  screenshotUrl: string; // Datos base64 o mock de imagen
  status: YapePaymentStatus;
  rejectionReason?: string;
  dateCreated: string;
}

// Interfaz para la respuesta o error estándar en transacciones virtuales
export interface PadelCashResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: 'INSUFFICIENT_POINTS' | 'USER_NOT_FOUND' | 'PAYMENT_NOT_FOUND' | 'COUPON_ALREADY_USED' | 'VALIDATION_FAILED';
    message: string;
  };
}
