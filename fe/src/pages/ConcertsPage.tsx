import { useEffect, useState } from "react";
import { Link } from "react-router";
import { concertAPI } from "@/services/api";
import type { Concert } from "@/types";
import { fmtDate, getAssetUrl } from "@/lib/utils";
import { Calendar, MapPin, Loader2, Search, Music } from "lucide-react";

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    concertAPI
      .list()
      .then(setConcerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredConcerts = concerts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.venue.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="relative min-h-[320px] rounded-[2rem] overflow-hidden flex items-center justify-center p-8 md:p-12 group">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/50" />
        
        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        <div className="relative z-10 w-full max-w-4xl space-y-6 flex flex-col items-center text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-bold text-violet-300 uppercase tracking-[0.2em] animate-fade-in mx-auto">
              <Music className="w-3 h-3" /> Trải nghiệm âm nhạc đỉnh cao
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-xl">
              Săn Vé Sự Kiện <span className="shimmer-text">Tuyệt Đỉnh</span>
            </h1>
            <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto leading-relaxed px-4">
              Khám phá hàng ngàn concert hot nhất từ các nghệ sĩ hàng đầu. 
              Đặt vé nhanh chóng, an toàn và bắt đầu hành trình ngay.
            </p>
          </div>
          
          <div className="relative w-full max-w-lg mx-auto group/search transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/40 group-focus-within/search:text-violet-400 transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-xl pl-14 pr-6 py-3.5 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/30 transition-all text-sm md:text-base"
                placeholder="Tìm kiếm concert, địa điểm..."
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Hỗ trợ 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Thanh toán an toàn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Vé điện tử nhanh chóng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Sự kiện Đang mở bán{" "}
            <span className="text-sm font-normal text-foreground/50">
              ({filteredConcerts.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
            <p className="text-foreground/50">Đang tải danh sách sự kiện...</p>
          </div>
        ) : filteredConcerts.length === 0 ? (
          <div className="glass-card py-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Music className="w-8 h-8 text-foreground/20" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Không tìm thấy sự kiện nào
            </h3>
            <p className="text-foreground/50">
              Vui lòng thử lại với từ khóa khác.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConcerts.map((concert) => (
              <Link
                key={concert._id}
                to={`/concerts/${concert._id}`}
                className="block group"
              >
                <div className="glass-card-hover overflow-hidden h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 relative">
                    {concert.bannerUrl ||
                    (concert.images && concert.images.length > 0) ? (
                      <img
                        src={getAssetUrl(
                          concert.bannerUrl || concert.images?.[0],
                        )}
                        alt={concert.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="w-12 h-12 text-foreground/20 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-semibold text-foreground">
                      Đang mở bán
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-violet-400 transition-colors">
                      {concert.name}
                    </h3>

                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center gap-2 text-foreground/60 text-sm">
                        <Calendar className="w-4 h-4 text-violet-400" />
                        <span>{fmtDate(concert.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground/60 text-sm">
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
