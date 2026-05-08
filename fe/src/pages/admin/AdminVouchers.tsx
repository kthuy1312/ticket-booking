import { useEffect, useState } from 'react';
import { voucherAPI, operationAPI } from '@/services/api';
import type { Voucher } from '@/types';
import { fmtDate, fmtCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Edit2, Tag, Plus, Power, Loader2, Info, X } from 'lucide-react';

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

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

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
  };

  const openCreateModal = () => {
    setEditingVoucher(null);
    setCode(''); setDescription(''); setDiscountType('FIXED'); setDiscountValue(0); setMinOrderAmount(0); setMaxUsage(100); setValidFrom(''); setValidUntil('');
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setCode(voucher.code);
    setDescription(voucher.description || '');
    setDiscountType(voucher.discountType);
    setDiscountValue(voucher.discountValue);
    setMinOrderAmount(voucher.minOrderAmount);
    setMaxUsage(voucher.maxUsage);
    setValidFrom(formatDateForInput(voucher.validFrom));
    setValidUntil(formatDateForInput(voucher.validUntil));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxUsage: Number(maxUsage),
      validFrom: new Date(validFrom).toISOString(),
      validUntil: new Date(validUntil).toISOString(),
    };

    try {
      if (editingVoucher) {
        await voucherAPI.update(editingVoucher._id, data);
        toast.success('Cập nhật voucher thành công');
      } else {
        await voucherAPI.create(data);
        toast.success('Tạo Voucher thành công');
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
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
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div className="animate-fade-in-up space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Tag className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mã Giảm Giá</h1>
              <p className="text-foreground/50 text-sm mt-1">Quản lý và theo dõi tỷ lệ sử dụng Voucher</p>
            </div>
          </div>
          <button 
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tạo Voucher Mới
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map(v => {
            const isExpired = new Date(v.validUntil) < new Date();
            const isSoldOut = v.currentUsage >= v.maxUsage;
            const isAvailable = v.isActive && !isExpired && !isSoldOut;

            return (
              <div key={v._id} className={`glass-card relative overflow-hidden transition-all duration-300 ${!isAvailable ? 'opacity-70 grayscale' : 'hover:scale-[1.02]'}`}>
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
                    <h3 className="text-xl font-bold font-mono text-foreground tracking-widest">{v.code}</h3>
                  </div>
                  
                  <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 mb-4">
                    Giảm {v.discountType === 'PERCENT' ? `${v.discountValue}%` : fmtCurrency(v.discountValue)}
                  </p>

                  <div className="space-y-2 text-sm text-foreground/60 mb-6">
                    <p>Đơn tối thiểu: <span className="text-foreground">{fmtCurrency(v.minOrderAmount)}</span></p>
                    <p>HSD: <span className="text-foreground">{fmtDate(v.validUntil)}</span></p>
                  </div>

                  <div className="space-y-1 mb-6">
                    <div className="flex justify-between text-xs text-foreground/50">
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

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleStatus(v._id, v.isActive)}
                      className={cn(
                        "flex-1 py-2 flex items-center justify-center gap-2 rounded-lg transition-colors text-sm font-semibold",
                        v.isActive 
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      )}
                    >
                      <Power className="w-4 h-4" />
                      {v.isActive ? 'Tắt' : 'Bật'}
                    </button>
                    <button 
                      onClick={() => openEditModal(v)}
                      className="p-2 bg-white/5 hover:bg-white/10 text-foreground/60 hover:text-foreground rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {vouchers.length === 0 && !loading && (
          <div className="glass-card py-20 flex flex-col items-center text-center">
            <Info className="w-12 h-12 text-foreground/20 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Chưa có Voucher nào</h3>
            <p className="text-foreground/50">Tạo voucher mới để thu hút khách hàng đặt vé.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content">
            <button onClick={() => setIsModalOpen(false)} className="modal-close">×</button>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {editingVoucher ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Mã Voucher</label>
                  <input required type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="input-field uppercase font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Loại giảm giá</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="input-field appearance-none bg-black/20">
                    <option value="FIXED">Cố định (VNĐ)</option>
                    <option value="PERCENT">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Mức giảm giá</label>
                  <input required type="number" value={discountValue || ''} onChange={e => setDiscountValue(e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input required type="number" value={minOrderAmount || ''} onChange={e => setMinOrderAmount(e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Số lượt dùng tối đa</label>
                  <input required type="number" value={maxUsage || ''} onChange={e => setMaxUsage(e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Hiệu lực từ</label>
                    <input required type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/70 mb-1">Đến hết</label>
                    <input required type="datetime-local" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="input-field" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Mô tả</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {editingVoucher ? 'Lưu Thay Đổi' : 'Phát Hành Voucher'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
