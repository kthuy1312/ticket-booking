// ── Types shared across the app ────────────────────────────────────────────

export interface User {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface Concert {
  _id: string;
  name: string;
  description?: string;
  venue: string;
  eventDate: string;
  saleStartDate: string;
  saleEndDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  bannerUrl?: string;
  seatMapImage?: string;
  images?: string[];
  createdBy?: string | { _id: string; fullName: string; email: string };
  createdAt?: string;
}

export interface TicketType {
  _id: string;
  concertId: string;
  name: string;
  description?: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  maxPerBooking: number;
  sortOrder?: number;
}

export interface Booking {
  _id: string;
  userId: string | User;
  concertId: string | Concert;
  ticketTypeId: string | TicketType;
  voucherId?: string | Voucher | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalAmount: number;
  status: 'RECEIVED' | 'RESERVED' | 'WAITING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  idempotencyKey?: string;
  reservedAt?: string;
  expiredAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingLog {
  _id: string;
  bookingId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string | User;
  reason?: string;
  createdAt: string;
}

export interface Voucher {
  _id: string;
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  maxUsage: number;
  currentUsage: number;
  minOrderAmount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdBy?: string | User;
  usageRate?: number;
  remainingUsage?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardStats {
  totalBookings: number;
  bookingsByStatus: Record<string, number>;
  confirmedRevenue: number;
  confirmedBookings: number;
  totalConcerts: number;
  totalVouchers: number;
}
