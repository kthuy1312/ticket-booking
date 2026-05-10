import api from '@/lib/axios';
import type { Booking, Concert, TicketType, Voucher, DashboardStats, Pagination } from '@/types';

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    api.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data.user),
};

// ── Concerts ─────────────────────────────────────────────────
export const concertAPI = {
  list: (params?: { page?: number; limit?: number; q?: string; month?: string; venue?: string; sort?: string }) => 
    api.get('/concerts', { params }).then(r => r.data as { concerts: Concert[]; pagination: Pagination }),
  filters: () => api.get('/concerts/filters').then(r => r.data as { venues: string[]; months: string[] }),
  get: (id: string) => api.get(`/concerts/${id}`).then(r => r.data.concert as Concert),
  ticketTypes: (id: string) => api.get(`/concerts/${id}/ticket-types`).then(r => r.data.ticketTypes as TicketType[]),
  create: (data: object) => api.post('/concerts', data).then(r => r.data),
  update: (id: string, data: FormData | object) => api.put(`/concerts/${id}`, data).then(r => r.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/concerts/${id}/status`, { status }).then(r => r.data),
};

// ── Bookings ──────────────────────────────────────────────────
export const bookingAPI = {
  create: (data: {
    concertId: string;
    ticketTypeId: string;
    quantity: number;
    voucherCode?: string;
    idempotencyKey: string;
  }) => api.post('/bookings', data).then(r => r.data),

  myBookings: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/bookings/my', { params }).then(r => r.data as { bookings: Booking[]; pagination: Pagination }),

  get: (id: string) => api.get(`/bookings/${id}`).then(r => r.data.booking as Booking),
  confirmPayment: (id: string) => api.post(`/bookings/${id}/confirm-payment`).then(r => r.data),
  cancel: (id: string, reason?: string) =>
    api.post(`/bookings/${id}/cancel`, { reason }).then(r => r.data),
};

// ── Vouchers ──────────────────────────────────────────────────
export const voucherAPI = {
  validate: (code: string, amount: number) =>
    api.get('/vouchers/validate', { params: { code, amount } }).then(r => r.data),
  create: (data: object) => api.post('/vouchers', data).then(r => r.data),
  update: (id: string, data: object) => api.put(`/vouchers/${id}`, data).then(r => r.data),
  list: (params?: { isActive?: boolean; page?: number; limit?: number }) =>
    api.get('/vouchers', { params }).then(r => r.data as { vouchers: Voucher[]; pagination: Pagination }),
  toggleStatus: (id: string) => api.patch(`/vouchers/${id}/toggle-status`).then(r => r.data),
};

// ── Operation Dashboard ───────────────────────────────────────
export const operationAPI = {
  stats: () => api.get('/operation/stats').then(r => r.data.stats as DashboardStats),
  
  allBookings: (params?: { status?: string; concertId?: string; userId?: string; page?: number; limit?: number; q?: string }) =>
    api.get('/operation/bookings', { params }).then(r => r.data as { bookings: Booking[]; pagination: Pagination }),
  
  bookingDetail: (id: string) =>
    api.get(`/operation/bookings/${id}`).then(r => r.data as { booking: Booking; logs: any[] }),
  
  updateBookingStatus: (id: string, status: string, reason?: string) =>
    api.patch(`/operation/bookings/${id}/status`, { status, reason }).then(r => r.data),

  allConcerts: (params?: { status?: string; page?: number; limit?: number; q?: string }) =>
    api.get('/operation/concerts', { params }).then(r => r.data as { concerts: Concert[]; pagination: Pagination }),

  createTicketType: (concertId: string, data: object) =>
    api.post(`/operation/concerts/${concertId}/ticket-types`, data).then(r => r.data),

  updateTicketType: (id: string, data: object) =>
    api.put(`/operation/ticket-types/${id}`, data).then(r => r.data),

  ticketAvailability: (ticketTypeId: string) =>
    api.get(`/operation/ticket-types/${ticketTypeId}/availability`).then(r => r.data.ticketType),

  voucherStats: (params?: { page?: number; limit?: number; q?: string }) => 
    api.get('/operation/vouchers', { params }).then(r => r.data as { vouchers: Voucher[]; pagination: Pagination }),
};
