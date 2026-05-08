import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { concertAPI, bookingAPI, voucherAPI } from '@/services/api';
import type { Concert, TicketType } from '@/types';
import { fmtDate, fmtCurrency, generateIdempotencyKey, cn, getAssetUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';
import { Calendar, MapPin, Loader2, Info, Ticket, Tag, CheckCircle2 } from 'lucide-react';

export default function ConcertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [concert, setConcert] = useState<Concert | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherData, setVoucherData] = useState<{ discountValue: number, type: 'FIXED' | 'PERCENT' } | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      concertAPI.get(id),
      concertAPI.ticketTypes(id)
    ])
      .then(([cData, tData]) => {
        setConcert(cData);
        setTicketTypes(tData);
      })
      .catch((err) => {
        toast.error('Không thể tải thông tin sự kiện');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const selectedTicket = ticketTypes.find(t => t._id === selectedTicketId);
  
  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return toast.warning('Vui lòng nhập mã voucher');
    if (!selectedTicket) return toast.warning('Vui lòng chọn vé trước khi áp dụng voucher');
    
    setValidatingVoucher(true);
    try {
      const orderAmount = selectedTicket.price * quantity;
      const res = await voucherAPI.validate(voucherCode, orderAmount);
      setVoucherData({ discountValue: res.discountValue || 0, type: res.voucher?.discountType || 'FIXED' });
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mã không hợp lệ');
      setVoucherData(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleBookTicket = async () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để đặt vé');
      return navigate('/login');
    }
    if (!selectedTicketId) return toast.warning('Vui lòng chọn loại vé');

    setBookingLoading(true);
    try {
      await bookingAPI.create({
        concertId: id!,
        ticketTypeId: selectedTicketId,
        quantity,
        voucherCode: voucherData ? voucherCode : undefined,
        idempotencyKey: generateIdempotencyKey()
      });
      
      toast.success('Đã giữ chỗ thành công! Vui lòng thanh toán.');
      navigate('/my-bookings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể đặt vé lúc này');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
      </div>
    );
  }

  if (!concert) return <div className="text-center text-white/50 py-20">Không tìm thấy sự kiện.</div>;

  // Calculate totals
  const subTotal = selectedTicket ? selectedTicket.price * quantity : 0;
  let discount = 0;
  if (voucherData && selectedTicket) {
    if (voucherData.type === 'FIXED') {
      discount = voucherData.discountValue;
    } else {
      discount = Math.round(subTotal * (voucherData.discountValue / 100));
    }
  }
  const total = Math.max(0, subTotal - discount);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Concert Info Header */}
      <div className="glass-card overflow-hidden">
        <div 
          className="h-48 md:h-80 bg-gradient-to-r from-violet-900/60 to-indigo-900/60 relative flex items-end p-8 md:p-12 bg-cover bg-center"
          style={concert.bannerUrl ? { backgroundImage: `linear-gradient(to right, rgba(15, 12, 41, 0.7), rgba(48, 43, 99, 0.7)), url(${getAssetUrl(concert.bannerUrl)})` } : {}}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {concert.status === 'ACTIVE' ? 'Đang mở bán' : 'Chưa mở bán'}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{concert.name}</h1>
            <div className="flex flex-wrap gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                <span className="font-medium">{fmtDate(concert.eventDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                <span className="font-medium">{concert.venue}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gallery Section */}
        {concert.images && concert.images.length > 0 && (
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
             <div className="flex gap-4 overflow-x-auto beautiful-scrollbar pb-2">
                {concert.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={getAssetUrl(img)} 
                    alt={`${concert.name} gallery ${idx}`} 
                    className="h-32 md:h-48 rounded-xl object-cover hover:scale-105 transition-transform cursor-pointer border border-white/10"
                  />
                ))}
             </div>
          </div>
        )}

        <div className="p-8 border-t border-white/5">
          <h3 className="text-xl font-semibold text-white mb-3">Giới thiệu sự kiện</h3>
          <p className="text-white/60 leading-relaxed max-w-4xl">{concert.description || 'Chưa có thông tin mô tả chi tiết.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Selection Area */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-violet-400" /> Chọn loại vé
          </h2>
          
          <div className="space-y-4">
            {ticketTypes.map(ticket => {
              const isAvailable = ticket.availableQuantity > 0;
              const isSelected = selectedTicketId === ticket._id;
              
              return (
                <div 
                  key={ticket._id}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedTicketId(ticket._id);
                      setQuantity(1);
                      setVoucherData(null); // Reset voucher when changing ticket
                    }
                  }}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300",
                    isAvailable ? "cursor-pointer" : "opacity-60 grayscale cursor-not-allowed",
                    isSelected ? "ticket-card-selected scale-[1.02]" : "ticket-card"
                  )}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        {ticket.name}
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-violet-400" />}
                      </h4>
                      {ticket.description && (
                        <p className="text-sm text-white/50 mt-1">{ticket.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-violet-300">{fmtCurrency(ticket.price)}</div>
                      <div className="text-xs text-white/40 mt-1">
                        {isAvailable ? `Còn ${ticket.availableQuantity} vé` : 'Hết vé'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checkout Panel */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-28 space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Thông tin đơn hàng</h3>
            
            {selectedTicket ? (
              <>
                <div className="space-y-4 pb-6 border-b border-white/10">
                  <div className="flex justify-between text-white/80">
                    <span>Loại vé:</span>
                    <span className="font-semibold text-white">{selectedTicket.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/80">
                    <span>Số lượng:</span>
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/10">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-semibold text-white">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(selectedTicket.maxPerBooking, selectedTicket.availableQuantity, quantity + 1))}
                        className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-white/40 text-right">Tối đa {selectedTicket.maxPerBooking} vé/lần</p>
                </div>

                <div className="space-y-4 pb-6 border-b border-white/10">
                  <label className="block text-sm font-medium text-white/70">Mã giảm giá</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-4 w-4 text-white/40" />
                      </div>
                      <input 
                        type="text" 
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        className="input-field pl-9 uppercase" 
                        placeholder="Nhập mã"
                      />
                    </div>
                    <button 
                      onClick={handleValidateVoucher}
                      disabled={validatingVoucher || !voucherCode}
                      className="btn-ghost !px-4"
                    >
                      {validatingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
                    </button>
                  </div>
                  {voucherData && (
                    <p className="text-sm text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Đã áp dụng mã giảm giá
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Tạm tính</span>
                    <span>{fmtCurrency(subTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 text-sm">
                      <span>Giảm giá</span>
                      <span>-{fmtCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-white/10">
                    <span>Tổng tiền</span>
                    <span className="text-violet-400">{fmtCurrency(total)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBookTicket}
                  disabled={bookingLoading || user?.role === 'ADMIN'}
                  className={cn(
                    "btn-primary w-full mt-6 py-3.5 text-lg shadow-xl",
                    user?.role === 'ADMIN' ? "opacity-50 cursor-not-allowed grayscale" : "shadow-violet-500/20"
                  )}
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                    </span>
                  ) : user?.role === 'ADMIN' ? 'Admin chỉ xem, không đặt vé' : 'Đặt vé ngay'}
                </button>
              </>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-xl">
                <Info className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/50 text-sm">Vui lòng chọn loại vé ở danh sách bên cạnh để xem tóm tắt đơn hàng.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
