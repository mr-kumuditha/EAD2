// Booking Types
export interface Booking {
  id: number;
  bookingRef: string;
  userId: number;
  eventId: number;
  ticketId: number;
  ticketType: 'EARLY_BIRD' | 'STANDARD' | 'VIP';
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  reservationExpiry: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface ReservationRequest {
  eventId: number;
  ticketId: number;
  quantity: number;
}

export type ReservationResponse = Booking;

export interface PaymentRequest {
  bookingId?: number; // Optional since it's passed in the URL
  paymentMethod: string; // e.g., 'CREDIT_CARD', 'DEBIT_CARD', etc.
  transactionId?: string;
  // Add more fields as needed
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  status?: 'CONFIRMED' | 'FAILED' | 'PENDING';
}
