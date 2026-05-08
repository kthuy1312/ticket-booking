import { useEffect, useState } from 'react';
import { operationAPI, concertAPI } from '@/services/api';
import type { Concert, TicketType } from '@/types';
import { fmtDate, fmtCurrency, CONCERT_STATUS_LABELS, getAssetUrl, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Music, Plus, Edit2, CheckCircle2, Ticket, Loader2, X, Upload, Image as ImageIcon, Map } from 'lucide-react';

export default function AdminConcerts() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConcert, setEditingConcert] = useState<Concert | null>(null);

  // Ticket Modal states
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedConcertForTickets, setSelectedConcertForTickets] = useState<Concert | null>(null);
  const [concertTickets, setConcertTickets] = useState<TicketType[]>([]);
  const [ticketLoading, setTicketLoading] = useState(false);

  // Ticket Form states
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [ticketName, setTicketName] = useState('');
  const [ticketPrice, setTicketPrice] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(0);
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSortOrder, setTicketSortOrder] = useState(0);

  // Form states
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [saleStartDate, setSaleStartDate] = useState('');
  const [saleEndDate, setSaleEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [seatMapFile, setSeatMapFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [existingBanner, setExistingBanner] = useState<string | null>(null);
  const [existingSeatMap, setExistingSeatMap] = useState<string | null>(null);

  const fetchConcerts = () => {
    operationAPI.allConcerts()
      .then(setConcerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
  };

  const openCreateModal = () => {
    setEditingConcert(null);
    setName(''); setVenue(''); setEventDate(''); setSaleStartDate(''); setSaleEndDate(''); setDescription(''); setBannerFile(null); setSeatMapFile(null); setGalleryFiles(null);
    setExistingImages([]); setRemovedImages([]); setExistingBanner(null); setExistingSeatMap(null);
    setIsModalOpen(true);
  };

  const openEditModal = (concert: Concert) => {
    setEditingConcert(concert);
    setName(concert.name);
    setVenue(concert.venue);
    setEventDate(formatDateForInput(concert.eventDate));
    setSaleStartDate(formatDateForInput(concert.saleStartDate));
    setSaleEndDate(formatDateForInput(concert.saleEndDate));
    setDescription(concert.description || '');
    setBannerFile(null);
    setSeatMapFile(null);
    setGalleryFiles(null);
    setExistingImages(concert.images || []);
    setRemovedImages([]);
    setExistingBanner(concert.bannerUrl || null);
    setExistingSeatMap(concert.seatMapImage || null);
    setIsModalOpen(true);
  };

  const openTicketModal = async (concert: Concert) => {
    setSelectedConcertForTickets(concert);
    setIsTicketModalOpen(true);
    fetchTickets(concert._id);
  };

  const fetchTickets = async (concertId: string) => {
    setTicketLoading(true);
    try {
      const data = await concertAPI.ticketTypes(concertId);
      setConcertTickets(data);
    } catch (err) {
      toast.error('Lỗi tải danh sách vé');
    } finally {
      setTicketLoading(false);
    }
  };

  const resetTicketForm = () => {
    setEditingTicketId(null);
    setTicketName('');
    setTicketPrice(0);
    setTicketQuantity(0);
    setTicketDesc('');
    setTicketSortOrder(0);
  };

  const handleEditTicket = (ticket: TicketType) => {
    setEditingTicketId(ticket._id);
    setTicketName(ticket.name);
    setTicketPrice(ticket.price);
    setTicketQuantity(ticket.totalQuantity);
    setTicketDesc(ticket.description || '');
    setTicketSortOrder(ticket.sortOrder || 0);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConcertForTickets) return;

    try {
      const data = {
        name: ticketName,
        price: ticketPrice,
        totalQuantity: ticketQuantity,
        description: ticketDesc,
        sortOrder: ticketSortOrder
      };

      if (editingTicketId) {
        await operationAPI.updateTicketType(editingTicketId, data);
        toast.success('Cập nhật vé thành công');
      } else {
        await operationAPI.createTicketType(selectedConcertForTickets._id, data);
        toast.success('Thêm vé mới thành công');
      }
      resetTicketForm();
      fetchTickets(selectedConcertForTickets._id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi thao tác vé');
    }
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
    setRemovedImages(prev => [...prev, imageUrl]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('venue', venue);
    formData.append('description', description);
    formData.append('eventDate', new Date(eventDate).toISOString());
    formData.append('saleStartDate', new Date(saleStartDate).toISOString());
    formData.append('saleEndDate', new Date(saleEndDate).toISOString());
    
    if (bannerFile) formData.append('banner', bannerFile);
    if (seatMapFile) formData.append('seatMap', seatMapFile);
    if (galleryFiles) {
      Array.from(galleryFiles).forEach(file => formData.append('images', file));
    }
    
    if (removedImages.length > 0) {
      formData.append('removedImages', JSON.stringify(removedImages));
    }

    try {
      if (editingConcert) {
        await concertAPI.update(editingConcert._id, formData);
        toast.success('Cập nhật concert thành công');
      } else {
        await concertAPI.create(formData);
        toast.success('Tạo concert thành công');
      }
      setIsModalOpen(false);
      fetchConcerts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      await concertAPI.updateStatus(id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchConcerts();
    } catch (err: any) {
      toast.error('Lỗi cập nhật trạng thái');
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
              <Music className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sự kiện</h1>
              <p className="text-foreground/50 text-sm mt-1">Quản lý danh sách các Concert</p>
            </div>
          </div>
          <button 
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tạo mới
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-foreground/60 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Tên Sự Kiện</th>
                  <th className="p-4 font-semibold">Trạng Thái</th>
                  <th className="p-4 font-semibold">Thời Gian Diễn Ra</th>
                  <th className="p-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="text-foreground/80">
                {concerts.map(concert => (
                  <tr key={concert._id} className="table-row">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          {(concert.bannerUrl || (concert.images && concert.images.length > 0)) ? (
                            <img 
                              src={getAssetUrl(concert.bannerUrl || concert.images?.[0])} 
                              className="w-full h-full object-cover" 
                              alt="" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-4 h-4 text-foreground/20" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{concert.name}</div>
                          <div className="text-xs text-foreground/50">{concert.venue}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        concert.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 
                        concert.status === 'DRAFT' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {CONCERT_STATUS_LABELS[concert.status] || concert.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {fmtDate(concert.eventDate)}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(concert)}
                        className="btn-ghost !p-2 !rounded-lg text-xs"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleStatus(concert._id, concert.status)}
                        className="btn-ghost !p-2 !rounded-lg text-xs"
                        title="Đổi trạng thái (Draft <-> Active)"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openTicketModal(concert)}
                        className="btn-ghost !p-2 !rounded-lg text-xs" 
                        title="Quản lý loại vé"
                      >
                        <Ticket className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {concerts.length === 0 && (
              <div className="p-8 text-center text-foreground/50">Chưa có sự kiện nào.</div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-content">
            <button onClick={() => setIsModalOpen(false)} className="modal-close">×</button>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {editingConcert ? 'Chỉnh Sửa Sự Kiện' : 'Tạo Sự Kiện Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Tên sự kiện</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Địa điểm</label>
                  <input required type="text" value={venue} onChange={e => setVenue(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Thời gian diễn ra</label>
                  <input required type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Bắt đầu bán vé</label>
                  <input required type="datetime-local" value={saleStartDate} onChange={e => setSaleStartDate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Kết thúc bán</label>
                  <input required type="datetime-local" value={saleEndDate} onChange={e => setSaleEndDate(e.target.value)} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/70 mb-1">Mô tả</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="input-field" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-foreground/70 mb-2 text-emerald-400">Ảnh Banner</label>
                  <label className="relative group cursor-pointer block">
                    <div className={cn(
                      "relative overflow-hidden border-2 border-dashed rounded-2xl transition-all duration-300 h-40 flex flex-col items-center justify-center",
                      bannerFile 
                        ? "border-emerald-500/50 bg-emerald-500/5" 
                        : (existingBanner ? "border-white/20" : "border-white/10 bg-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5")
                    )}>
                      {existingBanner && !bannerFile ? (
                        <>
                          <img 
                            src={getAssetUrl(existingBanner)} 
                            alt="Current Banner" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-8 h-8 text-white mb-2" />
                            <p className="text-white text-sm font-bold">Thay đổi Banner</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className={cn("w-8 h-8 mb-2 transition-colors", bannerFile ? "text-emerald-400" : "text-foreground/20")} />
                          <span className="text-sm font-medium text-foreground/60 group-hover:text-emerald-400 transition-colors truncate max-w-full px-4 text-center">
                            {bannerFile ? bannerFile.name : "Chọn ảnh Banner"}
                          </span>
                          <p className="text-xs text-foreground/40 mt-1">Dung lượng tối đa 5MB</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setBannerFile(e.target.files?.[0] || null)} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-foreground/70 mb-2 text-sky-400">Sơ đồ chỗ ngồi</label>
                  <label className="relative group cursor-pointer block">
                    <div className={cn(
                      "relative overflow-hidden border-2 border-dashed rounded-2xl transition-all duration-300 h-40 flex flex-col items-center justify-center",
                      seatMapFile 
                        ? "border-sky-500/50 bg-sky-500/5" 
                        : (existingSeatMap ? "border-white/20" : "border-white/10 bg-white/5 hover:border-sky-500/30 hover:bg-sky-500/5")
                    )}>
                      {existingSeatMap && !seatMapFile ? (
                        <>
                          <img 
                            src={getAssetUrl(existingSeatMap)} 
                            alt="Current Seat Map" 
                            className="absolute inset-0 w-full h-full object-contain p-2 transition-transform group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Map className="w-8 h-8 text-white mb-2" />
                            <p className="text-white text-sm font-bold">Thay đổi Sơ đồ</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Map className={cn("w-8 h-8 mb-2 transition-colors", seatMapFile ? "text-sky-400" : "text-foreground/20")} />
                          <span className="text-sm font-medium text-foreground/60 group-hover:text-sky-400 transition-colors truncate max-w-full px-4 text-center">
                            {seatMapFile ? seatMapFile.name : "Chọn ảnh Sơ đồ"}
                          </span>
                          <p className="text-xs text-foreground/40 mt-1">Dung lượng tối đa 5MB</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => setSeatMapFile(e.target.files?.[0] || null)} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground/70 mb-2 text-violet-400">Thêm vào Gallery</label>
                  <label className="relative group cursor-pointer block">
                    <div className={cn(
                      "flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl transition-all duration-300",
                      galleryFiles && galleryFiles.length > 0
                        ? "border-violet-500/50 bg-violet-500/5" 
                        : "border-white/10 bg-white/5 hover:border-violet-500/30 hover:bg-violet-500/5"
                    )}>
                      <ImageIcon className={cn("w-8 h-8 mb-2 transition-colors", galleryFiles && galleryFiles.length > 0 ? "text-violet-400" : "text-foreground/20")} />
                      <span className="text-sm font-medium text-foreground/60 group-hover:text-violet-400 transition-colors">
                        {galleryFiles && galleryFiles.length > 0 ? `${galleryFiles.length} ảnh đã chọn` : "Chọn ảnh Gallery"}
                      </span>
                      <p className="text-xs text-foreground/40 mt-1">Có thể chọn nhiều ảnh</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={e => setGalleryFiles(e.target.files)} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {existingImages.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground/70 mb-3 text-violet-400">Thư viện ảnh hiện tại</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20">
                          <img 
                            src={getAssetUrl(img)} 
                            alt="" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(img)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            title="Xóa ảnh này"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {editingConcert ? 'Lưu Thay Đổi' : 'Tạo Sự Kiện'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isTicketModalOpen && selectedConcertForTickets && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsTicketModalOpen(false)}>
          <div className="modal-content !max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <button onClick={() => setIsTicketModalOpen(false)} className="modal-close">×</button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Quản lý loại vé</h2>
                <p className="text-sm text-foreground/50">{selectedConcertForTickets.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 overflow-hidden">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {editingTicketId ? <Edit2 className="w-4 h-4 text-violet-400" /> : <Plus className="w-4 h-4 text-violet-400" />}
                  {editingTicketId ? 'Cập nhật loại vé' : 'Thêm loại vé mới'}
                </h3>
                <form onSubmit={handleTicketSubmit} className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div>
                    <label className="block text-xs font-medium text-foreground/50 mb-1 uppercase tracking-wider">Tên loại vé</label>
                    <input required type="text" value={ticketName} onChange={e => setTicketName(e.target.value)} className="input-field" placeholder="Ví dụ: VIP, GA, Standard..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground/50 mb-1 uppercase tracking-wider">Giá vé (VNĐ)</label>
                      <input required type="number" value={ticketPrice || ''} onChange={e => setTicketPrice(e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground/50 mb-1 uppercase tracking-wider">Thứ tự (Sort)</label>
                      <input type="number" value={ticketSortOrder === 0 && ticketSortOrder !== null ? 0 : (ticketSortOrder || '')} onChange={e => setTicketSortOrder(e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/50 mb-1 uppercase tracking-wider">Tổng số lượng</label>
                    <input required type="number" value={ticketQuantity || ''} onChange={e => setTicketQuantity(e.target.value === '' ? 0 : Number(e.target.value))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/50 mb-1 uppercase tracking-wider">Mô tả loại vé</label>
                    <textarea rows={2} value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} className="input-field" placeholder="Thông tin thêm về loại vé..." />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="btn-primary flex-1">
                      {editingTicketId ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                    {editingTicketId && (
                      <button type="button" onClick={resetTicketForm} className="btn-ghost">Hủy</button>
                    )}
                  </div>
                </form>
              </div>

              {/* List Section */}
              <div className="lg:col-span-3 flex flex-col overflow-hidden">
                <h3 className="text-lg font-semibold text-foreground mb-4">Danh sách loại vé hiện tại</h3>
                {ticketLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {concertTickets.length === 0 ? (
                      <div className="text-center py-10 text-foreground/30 border-2 border-dashed border-white/5 rounded-2xl">
                        Chưa có loại vé nào được tạo.
                      </div>
                    ) : (
                      concertTickets.map(ticket => (
                        <div key={ticket._id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all group">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest">
                                  Thứ tự: {ticket.sortOrder || 0}
                                </span>
                                <h4 className="font-bold text-foreground">{ticket.name}</h4>
                              </div>
                              <div className="text-xl font-black text-violet-300 mt-1">{fmtCurrency(ticket.price)}</div>
                              <div className="text-xs text-foreground/40 mt-1">
                                Số lượng: <span className="text-foreground/70 font-semibold">{ticket.availableQuantity}</span> / {ticket.totalQuantity}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleEditTicket(ticket)}
                              className="p-2 rounded-lg bg-white/5 text-foreground/40 hover:text-violet-400 hover:bg-violet-400/10 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
