import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { concertAPI } from '@/services/api';
import type { Concert } from '@/types';
import { fmtDate, getAssetUrl } from '@/lib/utils';
import { Calendar, MapPin, Loader2, Search, Music } from 'lucide-react';

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    concertAPI.list()
      .then(setConcerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredConcerts = concerts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white shimmer-text">
            Săn Vé Sự Kiện Đỉnh Cao
          </h1>
          <p className="text-lg text-white/70">
            Khám phá những concert hot nhất và đặt vé ngay hôm nay. Trải nghiệm âm nhạc không giới hạn cùng TixNow.
          </p>
          
          <div className="relative mt-8 max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="text"
              className="input-field pl-11 bg-white/10 border-white/20 backdrop-blur-md"
              placeholder="Tìm kiếm concert, nghệ sĩ, địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Sự kiện Đang mở bán <span className="text-sm font-normal text-white/50">({filteredConcerts.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
            <p className="text-white/50">Đang tải danh sách sự kiện...</p>
          </div>
        ) : filteredConcerts.length === 0 ? (
          <div className="glass-card py-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy sự kiện nào</h3>
            <p className="text-white/50">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcerts.map((concert) => (
              <Link key={concert._id} to={`/concerts/${concert._id}`} className="block group">
                <div className="glass-card-hover overflow-hidden h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 relative">
                    {concert.bannerUrl || (concert.images && concert.images.length > 0) ? (
                      <img 
                        src={getAssetUrl(concert.bannerUrl || concert.images?.[0])} 
                        alt={concert.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="w-12 h-12 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-semibold text-white">
                      Đang mở bán
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-violet-400 transition-colors">
                      {concert.name}
                    </h3>
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar className="w-4 h-4 text-violet-400" />
                        <span>{fmtDate(concert.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        <span className="line-clamp-1">{concert.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
