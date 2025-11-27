import api from './api';
import type { Booking, ReservationRequest, PaymentRequest, PaymentResponse } from '../types/booking';

export class BookingService {
    private static readonly BASE_URL = '/bookings';

    static async reserveBooking(reservationData: ReservationRequest): Promise<Booking> {
        const response = await api.post(this.BASE_URL, reservationData);
        return response.data;
    }

    static async confirmPayment(bookingId: number, paymentData: PaymentRequest): Promise<PaymentResponse> {
        const response = await api.post(`${this.BASE_URL}/${bookingId}/confirm`, paymentData);
        return response.data;
    }

    static async getUserBookings(): Promise<Booking[]> {
        const response = await api.get(`${this.BASE_URL}/my-bookings`);
        return response.data;
    }

    static async getAllBookings(): Promise<Booking[]> {
        const response = await api.get(this.BASE_URL);
        return response.data;
    }

    static async getBookingById(id: number): Promise<Booking> {
        const response = await api.get(`${this.BASE_URL}/${id}`);
        return response.data;
    }

    static async getBookingByRef(ref: string): Promise<Booking> {
        const response = await api.get(`${this.BASE_URL}/ref/${ref}`);
        return response.data;
    }

    static async cancelBooking(id: number): Promise<string> {
        const response = await api.post(`${this.BASE_URL}/${id}/cancel`);
        return response.data;
    }

    static async confirmBooking(id: number): Promise<string> {
        const response = await api.put(`${this.BASE_URL}/${id}/confirm`);
        return response.data;
    }

    static async refundBooking(id: number): Promise<string> {
        const response = await api.put(`${this.BASE_URL}/${id}/refund`);
        return response.data;
    }

    static async getHealth(): Promise<string> {
        const response = await api.get(`${this.BASE_URL}/health`);
        return response.data;
    }
}

export default BookingService;
