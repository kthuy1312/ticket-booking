import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAssetUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '');
  return `${baseUrl}${path}`;
};

// Shared helper utilities

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export const fmtDate = (s: string | Date) =>
  new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const fmtDateTime = (s: string | Date) =>
  new Date(s).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const fmtCountdown = (expiredAt: string) => {
  const diff = new Date(expiredAt).getTime() - Date.now();
  if (diff <= 0) return 'Đã hết hạn';
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const generateIdempotencyKey = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Đã nhận',
  RESERVED: 'Đã giữ chỗ',
  WAITING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
};

export const CONCERT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang mở bán',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

export const STATUS_CLASS: Record<string, string> = {
  RECEIVED: 'status-received',
  RESERVED: 'status-reserved',
  WAITING_PAYMENT: 'status-waiting',
  CONFIRMED: 'status-confirmed',
  CANCELLED: 'status-cancelled',
  EXPIRED: 'status-expired',
};
