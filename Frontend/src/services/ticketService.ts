import api from './api';
import type { Ticket, CreateTicketRequest, UpdateTicketRequest, TicketAvailability } from '../types';

export class TicketService {
    private static readonly BASE_URL = '/tickets';

    static async getTicketsByEvent(eventId: number): Promise<Ticket[]> {
        const response = await api.get(`${this.BASE_URL}/event/${eventId}`);
        return response.data;
    }

    static async getAvailableTicketsByEvent(eventId: number): Promise<Ticket[]> {
        const response = await api.get(`${this.BASE_URL}/event/${eventId}/available`);
        return response.data;
    }

    static async getTicketByEventAndType(eventId: number, type: Ticket['type']): Promise<Ticket> {
        const response = await api.get(`${this.BASE_URL}/event/${eventId}/type/${type}`);
        return response.data;
    }

    static async getTicketsByStatus(eventId: number, status: Ticket['status']): Promise<Ticket[]> {
        const response = await api.get(`${this.BASE_URL}/event/${eventId}/status/${status}`);
        return response.data;
    }

    static async getTicketById(id: number): Promise<Ticket> {
        const response = await api.get(`${this.BASE_URL}/${id}`);
        return response.data;
    }

    static async createDefaultTickets(eventId: number): Promise<string> {
        const response = await api.post(`${this.BASE_URL}/event/${eventId}/default`);
        return response.data;
    }

    static async createTicket(ticketData: CreateTicketRequest): Promise<Ticket> {
        const response = await api.post(this.BASE_URL, ticketData);
        return response.data;
    }

    static async updateTicket(id: number, ticketData: UpdateTicketRequest): Promise<Ticket> {
        const response = await api.put(`${this.BASE_URL}/${id}`, ticketData);
        return response.data;
    }

    static async deleteTicket(id: number): Promise<void> {
        await api.delete(`${this.BASE_URL}/${id}`);
    }

    static async deleteAllTicketsForEvent(eventId: number): Promise<string> {
        const response = await api.delete(`${this.BASE_URL}/event/${eventId}`);
        return response.data;
    }

    static async reserveTickets(ticketId: number, quantity: number): Promise<string> {
        const response = await api.post(`${this.BASE_URL}/${ticketId}/reserve?quantity=${quantity}`);
        return response.data;
    }

    static async releaseTickets(ticketId: number, quantity: number): Promise<string> {
        const response = await api.post(`${this.BASE_URL}/${ticketId}/release?quantity=${quantity}`);
        return response.data;
    }

    static async checkAvailability(ticketId: number, quantity: number): Promise<TicketAvailability> {
        const response = await api.get(`${this.BASE_URL}/${ticketId}/availability?quantity=${quantity}`);
        return response.data;
    }

    static async getHealth(): Promise<string> {
        const response = await api.get(`${this.BASE_URL}/health`);
        return response.data;
    }
}

export default TicketService;
