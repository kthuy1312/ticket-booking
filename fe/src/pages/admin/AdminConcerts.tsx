import { useEffect, useState } from 'react';
import { operationAPI, concertAPI } from '@/services/api';
import type { Concert } from '@/types';
import { fmtDate, CONCERT_STATUS_LABELS, getAssetUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { Music, Plus, Edit2, CheckCircle2, Ticket, Loader2 } from 'lucide-react';

export default function AdminConcerts() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [saleStartDate, setSaleStartDate] = useState('');
  const [saleEndDate, setSaleEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);

  const fetchConcerts = () => {
    operationAPI.allConcerts()
      .then(setConcerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('venue', venue);
    formData.append('description', description);
    formData.append('eventDate', new Date(eventDate).toISOString());
    formData.append('saleStartDate', new Date(saleStartDate).toISOString());
    formData.append('saleEndDate', new Date(saleEndDate).toISOString());
    
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }
    
    if (galleryFiles) {
      Array.from(galleryFiles).forEach(file => {
        formData.append('images', file);
      });
    }

    try {
      await concertAPI.create(formData);
      toast.success('Tạo concert thành công');
      setIsCreating(false);
      setName(''); setVenue(''); setEventDate(''); setSaleStartDate(''); setSaleEndDate(''); setDescription(''); setBannerFile(null); setGalleryFiles(null);
      fetchConcerts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tạo concert');
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Music className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Sự kiện</h1>
            <p className="text-white/50 text-sm mt-1">Quản lý danh sách các Concert</p>
          </div>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="btn-primary flex items-center gap-2"
        >
          {isCreating ? 'Hủy bỏ' : <><Plus className="w-4 h-4" /> Tạo mới</>}
        </button>
      </div>

      {isCreating && (
        <div className="glass-card p-6 mb-8 animate-fade-in-up">
          <h2 className="text-xl font-bold text-white mb-4">Tạo Sự Kiện Mới</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Tên sự kiện</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Địa điểm</label>
                <input required type="text" value={venue} onChange={e => setVenue(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Thời gian diễn ra</label>
                <input required type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Bắt đầu bán vé</label>
                  <input required type="datetime-local" value={saleStartDate} onChange={e => setSaleStartDate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Kết thúc bán</label>
                  <input required type="datetime-local" value={saleEndDate} onChange={e => setSaleEndDate(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1">Mô tả</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1 text-emerald-400">Banner Sự Kiện (Chọn 1 ảnh)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setBannerFile(e.target.files?.[0] || null)} 
                  className="input-field py-1.5" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1 text-violet-400">Hình ảnh Gallery (Có thể chọn nhiều ảnh)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={e => setGalleryFiles(e.target.files)} 
                  className="input-field py-1.5" 
                />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-4">Lưu Sự Kiện</button>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/60 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Tên Sự Kiện</th>
                <th className="p-4 font-semibold">Trạng Thái</th>
                <th className="p-4 font-semibold">Thời Gian Diễn Ra</th>
                <th className="p-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {concerts.map(concert => (
                <tr key={concert._id} className="table-row">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        {concert.bannerUrl || concert.images?.[0] ? (
                          <img src={getAssetUrl(concert.bannerUrl || concert.images?.[0])} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{concert.name}</div>
                        <div className="text-xs text-white/50">{concert.venue}</div>
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
                      onClick={() => toggleStatus(concert._id, concert.status)}
                      className="btn-ghost !p-2 !rounded-lg text-xs"
                      title="Đổi trạng thái (Draft <-> Active)"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button className="btn-ghost !p-2 !rounded-lg text-xs" title="Thêm loại vé (Coming Soon)">
                      <Ticket className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {concerts.length === 0 && (
            <div className="p-8 text-center text-white/50">Chưa có sự kiện nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
