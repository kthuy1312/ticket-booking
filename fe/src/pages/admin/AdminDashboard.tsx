import { useEffect, useState } from 'react';
import { operationAPI } from '@/services/api';
import type { DashboardStats } from '@/types';
import { fmtCurrency } from '@/lib/utils';
import { Loader2, DollarSign, Ticket, Music, Tag, Users, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    operationAPI.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p className="text-white/50">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Tổng Doanh Thu', value: fmtCurrency(stats.confirmedRevenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Vé Đã Bán', value: stats.confirmedBookings, icon: Ticket, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { title: 'Tổng Sự Kiện', value: stats.totalConcerts, icon: Music, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { title: 'Tổng Voucher', value: stats.totalVouchers, icon: Tag, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <Activity className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Tổng Quan</h1>
          <p className="text-white/50 text-sm mt-1">Theo dõi hoạt động của hệ thống Melotix</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-white/50 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-white">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Trạng thái đơn hàng</h3>
          <div className="space-y-4">
            {Object.entries(stats.bookingsByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-sm font-medium text-white/70">{status}</span>
                <span className="text-lg font-bold text-white bg-white/10 px-3 py-1 rounded-md">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Users className="w-16 h-16 text-white/10 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Biểu đồ đang phát triển</h3>
          <p className="text-sm text-white/40 max-w-sm">
            Tính năng biểu đồ doanh thu chi tiết sẽ được cập nhật trong phiên bản tiếp theo của Admin Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
