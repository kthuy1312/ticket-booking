import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { concertAPI } from "@/services/api";
import type { Concert } from "@/types";
import { fmtDate, getAssetUrl } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Loader2,
  Search,
  Music,
  X,
  SortAsc,
  Headphones,
  ShieldCheck,
  Zap,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Select, Input, Pagination } from "antd";

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [filterOptions, setFilterOptions] = useState<{
    months: string[];
    venues: string[];
  }>({ months: [], venues: [] });

  const fetchConcerts = (p = page) => {
    setLoading(true);
    concertAPI
      .list({
        page: p,
        limit: pageSize,
        q: search,
        month: monthFilter,
        venue: venueFilter,
        sort: sortBy,
      })
      .then((res) => {
        setConcerts(res.concerts);
        setTotal(res.pagination.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    concertAPI.filters().then(setFilterOptions).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchConcerts(1);
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [search, monthFilter, venueFilter, sortBy]);

  // Handle page change separately to avoid debouncing when just changing page
  const handlePageChange = (p: number, s: number) => {
    setPage(p);
    setPageSize(s);
    setLoading(true);
    concertAPI
      .list({
        page: p,
        limit: s,
        q: search,
        month: monthFilter,
        venue: venueFilter,
        sort: sortBy,
      })
      .then((res) => {
        setConcerts(res.concerts);
        setTotal(res.pagination.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split("-");
    return `Tháng ${month}/${year}`;
  };

  const clearFilters = () => {
    setSearch("");
    setMonthFilter("all");
    setVenueFilter("all");
    setSortBy("date-asc");
    setPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    monthFilter !== "all" ||
    venueFilter !== "all" ||
    sortBy !== "date-asc";

  return (
    <div className="space-y-8 pb-20">
      <div className="relative min-h-[450px] md:min-h-[550px] rounded-[2.5rem] overflow-hidden flex items-center justify-center p-8 md:p-12 group shadow-2xl">
        {/* Banner Image with Zoom Animation */}
        <div className="absolute inset-0 z-0">
          <img
            src="/concert-banner.png"
            alt="Concert Hero Banner"
            className="w-full h-full object-cover animate-zoom-in"
          />
          {/* Overlays for better contrast and depth - Fixed dark colors for cinematic look */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Decorative Light Effects */}
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-violet-600/30 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div
          className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center animate-fade-in-up">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold text-violet-200 uppercase tracking-[0.25em] shadow-xl">
              <Music className="w-3.5 h-3.5 animate-bounce" /> Trải nghiệm âm
              nhạc đỉnh cao
            </div>

            <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tight">
              Săn Vé Sự Kiện <br />
              <span className="shimmer-text">Tuyệt Đỉnh</span>
            </h1>

            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed px-4 font-medium drop-shadow-md">
              Khám phá hàng ngàn concert hot nhất từ các nghệ sĩ hàng đầu thế
              giới. Đặt vé nhanh chóng, an toàn và bắt đầu hành trình âm nhạc
              của bạn ngay hôm nay.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-12">
            <div className="group/feat flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 animate-float">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover/feat:scale-110 group-hover/feat:rotate-3 transition-all">
                <Headphones className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.15em] leading-none mb-1.5">
                  Dịch vụ
                </div>
                <div className="text-sm font-bold text-white/90">
                  Hỗ trợ 24/7
                </div>
              </div>
            </div>

            <div
              className="group/feat flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 animate-float"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover/feat:scale-110 group-hover/feat:-rotate-3 transition-all">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.15em] leading-none mb-1.5">
                  Giao dịch
                </div>
                <div className="text-sm font-bold text-white/90">
                  An toàn tuyệt đối
                </div>
              </div>
            </div>

            <div
              className="group/feat flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 animate-float"
              style={{ animationDelay: "1s" }}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover/feat:scale-110 group-hover/feat:rotate-3 transition-all">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.15em] leading-none mb-1.5">
                  Tiện ích
                </div>
                <div className="text-sm font-bold text-white/90">
                  Vé điện tử nhanh
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator or Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-color)] to-transparent pointer-events-none" />
      </div>

      {/* Main List */}
      <div>
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black text-foreground flex items-center gap-4">
                Đang Diễn Ra
                <span className="px-3 py-1 rounded-xl bg-violet-500/10 text-violet-500 text-xs font-bold border border-violet-500/20">
                  {total} sự kiện
                </span>
              </h2>
              <p className="text-foreground/50 font-medium">
                Tìm thấy những buổi hòa nhạc phù hợp nhất với phong cách của bạn
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-fit text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/5 border border-violet-500/10 hover:border-violet-500/30 transition-all"
              >
                <X className="w-4 h-4" /> Xóa tất cả bộ lọc
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 glass-card border-white/5 shadow-xl relative overflow-hidden group/filters">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-transparent pointer-events-none" />

            {/* Month Filter */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 block">
                Thời gian
              </label>
              <Select
                value={monthFilter}
                onChange={setMonthFilter}
                className="w-full h-11"
                suffixIcon={<Calendar className="w-4 h-4 text-violet-400" />}
                popupClassName="glass-card !bg-[var(--bg-color)]"
                options={[
                  { value: "all", label: "Tất cả các tháng" },
                  ...filterOptions.months.map((m) => ({
                    value: m,
                    label: formatMonth(m),
                  })),
                ]}
              />
            </div>

            {/* Venue Filter */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 block">
                Địa điểm
              </label>
              <Select
                value={venueFilter}
                onChange={setVenueFilter}
                className="w-full h-11"
                suffixIcon={<MapPin className="w-4 h-4 text-indigo-400" />}
                popupClassName="glass-card !bg-[var(--bg-color)]"
                options={[
                  { value: "all", label: "Tất cả địa điểm" },
                  ...filterOptions.venues.map((v) => ({ value: v, label: v })),
                ]}
              />
            </div>

            {/* Sort Filter */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 block">
                Sắp xếp theo
              </label>
              <Select
                value={sortBy}
                onChange={setSortBy}
                className="w-full h-11"
                suffixIcon={<SortAsc className="w-4 h-4 text-emerald-400" />}
                popupClassName="glass-card !bg-[var(--bg-color)]"
                options={[
                  { value: "date-asc", label: "Ngày diễn ra (Gần nhất)" },
                  { value: "date-desc", label: "Ngày diễn ra (Xa nhất)" },
                  { value: "name-asc", label: "Tên sự kiện (A-Z)" },
                ]}
              />
            </div>

            {/* Search*/}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 block">
                Từ khóa nhanh
              </label>
              <Input
                prefix={<Search className="w-4 h-4 text-foreground/20 mr-2" />}
                placeholder="Lọc nhanh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 bg-foreground/[0.03] border-foreground/10 hover:border-violet-500/50 focus:border-violet-500/50 rounded-xl text-foreground"
                allowClear
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
            <p className="text-foreground/50">Đang tải danh sách sự kiện...</p>
          </div>
        ) : concerts.length === 0 ? (
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
            {concerts.map((concert) => (
              <Link
                key={concert._id}
                to={`/concerts/${concert._id}`}
                className="block group h-full"
              >
                <div className="glass-card-hover overflow-hidden h-full flex flex-col border-white/5 hover:border-violet-500/30 transition-all duration-500">
                  <div className="h-56 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 relative overflow-hidden">
                    {concert.bannerUrl ||
                    (concert.images && concert.images.length > 0) ? (
                      <img
                        src={getAssetUrl(
                          concert.bannerUrl || concert.images?.[0],
                        )}
                        alt={concert.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music className="w-12 h-12 text-foreground/20 group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}

                    {/* Dark overlay on image bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {(() => {
                      const now = new Date();
                      const start = new Date(concert.saleStartDate);
                      const end = new Date(concert.saleEndDate);

                      if (now < start) {
                        return (
                          <div className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-md border border-amber-400/30 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                            Sắp mở bán
                          </div>
                        );
                      } else if (now >= start && now <= end) {
                        return (
                          <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md border border-emerald-400/30 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg animate-pulse">
                            Đang mở bán
                          </div>
                        );
                      } else {
                        return (
                          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-md border border-red-400/30 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                            Hết hạn
                          </div>
                        );
                      }
                    })()}
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

        {/* Pagination */}
        {!loading && concerts.length > 0 && (
          <div className="mt-12 flex justify-center">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={["12", "24", "48"]}
              className="glass-card px-4 py-2 border-white/10"
            />
          </div>
        )}
      </div>
    </div>
  );
}
