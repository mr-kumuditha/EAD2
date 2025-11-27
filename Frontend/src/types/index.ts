export interface User {
    userId: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
    success: boolean;
    message: string;
    userId?: number;
    username?: string;
    email?: string;
    role?: 'USER' | 'ADMIN';
    firstName?: string;
    lastName?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
    role: 'USER' | 'ADMIN';
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}
// Event Types
export interface Event {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  date: string; // ISO string
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'COMPLETED';
  imageUrl?: string; // New field for image URL
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status?: Event['status']; // Optional status field
  image?: File; // New field for image file
}
export interface UpdateEventRequest {
  name?: string;
  description?: string;
  category?: string;
  location?: string;
  date?: string;
  status?: Event['status'];
}

// Ticket Types
export interface Ticket {
  id: number;
  eventId: number;
  type: 'EARLY_BIRD' | 'STANDARD' | 'VIP';
  price: number;
  quantityAvailable: number;
  maxPerUser: number;
  description: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'INACTIVE';
  saleStartDate?: string;
  saleEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  eventId: number;
  type: Ticket['type'];
  price: number;
  quantityAvailable: number;
  maxPerUser: number;
  description: string;
  status?: Ticket['status'];
  saleStartDate?: string;
  saleEndDate?: string;
}

export interface UpdateTicketRequest {
  type?: Ticket['type'];
  price?: number;
  quantityAvailable?: number;
  maxPerUser?: number;
  description?: string;
  status?: Ticket['status'];
  saleStartDate?: string;
  saleEndDate?: string;
}

export interface TicketAvailability {
  available: boolean;
  availableQuantity: number;
}
