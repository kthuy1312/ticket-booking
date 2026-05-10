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
      .then(data => {
        console.log('Dashboard stats:', data);
        setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p className="text-foreground/50">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Tổng Doanh Thu', value: fmtCurrency(stats.confirmedRevenue), icon: <DollarSign className="w-6 h-6" />, color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
    { title: 'Vé Đã Bán', value: stats.confirmedBookings, icon: <Ticket className="w-6 h-6" />, color: 'bg-violet-500/20 text-violet-600 dark:text-violet-400' },
    { title: 'Tổng Sự Kiện', value: stats.totalConcerts, icon: <Music className="w-6 h-6" />, color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' },
    { title: 'Tổng Voucher', value: stats.totalVouchers, icon: <Tag className="w-6 h-6" />, color: 'bg-pink-500/20 text-pink-600 dark:text-pink-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="animate-fade-in-up space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Activity className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tổng Quan</h1>
            <p className="text-foreground/50 text-sm mt-1">Theo dõi hoạt động của hệ thống Melotix</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <div key={i} className="glass-card p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-foreground/50 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">Trạng thái đơn hàng</h3>
            <div className="space-y-4">
              {Object.entries(stats.bookingsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-foreground/5 border border-foreground/5">
                  <span className="text-sm font-medium text-foreground/70">{status}</span>
                  <span className="text-lg font-bold text-foreground bg-foreground/10 px-3 py-1 rounded-md">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-foreground">Doanh thu 7 ngày qua</h3>
                <p className="text-xs text-foreground/50 mt-1">Thống kê doanh thu thực tế từ đơn hàng đã xác nhận</p>
              </div>
              <div className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full border border-violet-500/20">
                VNĐ
              </div>
            </div>
            
            <div className="h-[300px] w-full relative mt-4">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="w-full border-t border-foreground/5 flex justify-end">
                    <span className="text-[8px] text-foreground/20 -mt-2 mr-1"></span>
                  </div>
                ))}
              </div>

              {/* Bars Container */}
              <div className="absolute inset-0 flex items-end justify-around gap-3 px-2 pt-10 pb-6">
                {(() => {
                  const dailyData = stats.dailyRevenue || [];
                  if (dailyData.length === 0) {
                    return (
                      <div className="flex items-center justify-center w-full h-full text-foreground/20 text-sm italic">
                        Chưa có dữ liệu doanh thu
                      </div>
                    );
                  }
                  
                  const revenues = dailyData.map(d => d.revenue);
                  const maxRevenueValue = Math.max(...(revenues.length ? revenues : [0]));
                  const maxChartValue = maxRevenueValue > 0 ? maxRevenueValue * 1.2 : 1000000;
                  
                  return dailyData.map((day, idx) => {
                    const height = (day.revenue / maxChartValue) * 100;
                    const isToday = idx === dailyData.length - 1;
                    
                    return (
                      <div key={day.date} className="flex-1 h-full flex flex-col items-center justify-end group relative">
                        {/* Revenue Tooltip/Label */}
                        {day.revenue > 0 && (
                          <div 
                            className="absolute z-10 bottom-[calc(var(--bar-h)+35px)] left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                            style={{ '--bar-h': `${height}%` } as any}
                          >
                            {fmtCurrency(day.revenue)}
                          </div>
                        )}
                        
                        {/* Compact Label above bar */}
                        {day.revenue > 0 && (
                          <div 
                            className="absolute bottom-[calc(var(--bar-h)+10px)] left-1/2 -translate-x-1/2 text-[9px] font-bold text-violet-500 whitespace-nowrap"
                            style={{ '--bar-h': `${height}%` } as any}
                          >
                            {new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(day.revenue)}
                          </div>
                        )}

                        {/* The Bar */}
                        <div 
                          className={`w-full max-w-[40px] rounded-t-md transition-all duration-1000 ease-out relative group-hover:filter group-hover:brightness-110 shadow-md ${
                            isToday 
                              ? 'bg-gradient-to-t from-violet-600 to-violet-400' 
                              : day.revenue > 0 
                                ? 'bg-violet-500/40' 
                                : 'bg-foreground/5'
                          }`}
                          style={{ height: `${Math.max(height, 4)}%` }}
                        >
                          {/* Inner Shine */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                        </div>

                        {/* X-Axis Label */}
                        <div className="absolute top-[calc(100%+8px)] flex flex-col items-center">
                          <span className={`text-[10px] font-bold whitespace-nowrap ${
                            isToday ? 'text-violet-600' : 'text-foreground/50'
                          }`}>
                            {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                          </span>
                          <span className="text-[8px] text-foreground/30">
                            {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
