import { useEffect, useState } from 'react';
import { voucherAPI, operationAPI } from '@/services/api';
import type { Voucher } from '@/types';
import { fmtDate, fmtCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tag, Plus, Power, Loader2, Info } from 'lucide-react';

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [maxUsage, setMaxUsage] = useState(100);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const fetchVouchers = () => {
    operationAPI.voucherStats()
      .then(setVouchers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await voucherAPI.create({
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        maxUsage: Number(maxUsage),
        validFrom: new Date(validFrom).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
      });
      toast.success('Tạo Voucher thành công');
      setIsCreating(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tạo voucher');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    const action = isActive ? 'vô hiệu hóa' : 'kích hoạt';
    if (!confirm(`Bạn có chắc chắn muốn ${action} voucher này?`)) return;
    try {
      await voucherAPI.toggleStatus(id);
      toast.success(`Đã ${action} voucher thành công`);
      fetchVouchers();
    } catch (err: any) {
      toast.error(`Không thể ${action} voucher`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Tag className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Mã Giảm Giá</h1>
            <p className="text-white/50 text-sm mt-1">Quản lý và theo dõi tỷ lệ sử dụng Voucher</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="btn-primary flex items-center gap-2"
        >
          {isCreating ? 'Hủy bỏ' : <><Plus className="w-4 h-4" /> Tạo Voucher Mới</>}
        </button>
      </div>

      {isCreating && (
        <div className="glass-card p-6 mb-8 animate-fade-in-up border-l-4 border-l-violet-500">
          <h2 className="text-xl font-bold text-white mb-4">Tạo Voucher Mới</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Mã Voucher (Code)</label>
                <input required type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="input-field uppercase font-mono" placeholder="VD: FLASHSALE50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Loại giảm giá</label>
                <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="input-field appearance-none bg-black/20">
                  <option value="FIXED" className="bg-slate-900">Cố định (VNĐ)</option>
                  <option value="PERCENT" className="bg-slate-900">Phần trăm (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Mức giảm giá</label>
                <input required type="number" min="1" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="input-field" placeholder={discountType === 'FIXED' ? 'VD: 50000' : 'VD: 10'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Giá trị đơn tối thiểu (VNĐ)</label>
                <input required type="number" min="0" value={minOrderAmount} onChange={e => setMinOrderAmount(Number(e.target.value))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Số lượt dùng tối đa</label>
                <input required type="number" min="1" value={maxUsage} onChange={e => setMaxUsage(Number(e.target.value))} className="input-field" />
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Hiệu lực từ</label>
                  <input required type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Đến hết</label>
                  <input required type="datetime-local" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1">Mô tả (Tùy chọn)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-field" />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-4">Phát Hành Voucher</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.map(v => {
          const isExpired = new Date(v.validUntil) < new Date();
          const isSoldOut = v.currentUsage >= v.maxUsage;
          const isAvailable = v.isActive && !isExpired && !isSoldOut;

          return (
            <div key={v._id} className={`glass-card relative overflow-hidden transition-all duration-300 ${!isAvailable ? 'opacity-70 grayscale' : 'hover:scale-[1.02]'}`}>
              {/* Status Ribbon */}
              <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-bold ${
                !v.isActive ? 'bg-red-500/20 text-red-400' :
                isExpired ? 'bg-gray-500/20 text-gray-400' :
                isSoldOut ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {!v.isActive ? 'Đã Tắt' : isExpired ? 'Hết Hạn' : isSoldOut ? 'Hết Lượt' : 'Hoạt Động'}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-5 h-5 text-violet-400" />
                  <h3 className="text-xl font-bold font-mono text-white tracking-widest">{v.code}</h3>
                </div>
                
                <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-4">
                  Giảm {v.discountType === 'PERCENT' ? `${v.discountValue}%` : fmtCurrency(v.discountValue)}
                </p>

                <div className="space-y-2 text-sm text-white/60 mb-6">
                  <p>Đơn tối thiểu: <span className="text-white">{fmtCurrency(v.minOrderAmount)}</span></p>
                  <p>HSD: <span className="text-white">{fmtDate(v.validUntil)}</span></p>
                </div>

                {/* Progress Bar for Usage */}
                <div className="space-y-1 mb-6">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>Đã dùng: {v.currentUsage}</span>
                    <span>Tối đa: {v.maxUsage}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, (v.currentUsage / v.maxUsage) * 100)}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleToggleStatus(v._id, v.isActive)}
                  className={cn(
                    "w-full py-2 flex items-center justify-center gap-2 rounded-lg transition-colors text-sm font-semibold",
                    v.isActive 
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  )}
                >
                  <Power className="w-4 h-4" />
                  {v.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {vouchers.length === 0 && !loading && (
        <div className="glass-card py-20 flex flex-col items-center text-center">
          <Info className="w-12 h-12 text-white/20 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Chưa có Voucher nào</h3>
          <p className="text-white/50">Tạo voucher mới để thu hút khách hàng đặt vé.</p>
        </div>
      )}
    </div>
  );
}
