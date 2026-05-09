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
      <div className="relative min-h-[320px] rounded-[2rem] overflow-hidden flex items-center justify-center p-8 md:p-12 group">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-[#0f172a]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
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
              Khám phá hàng ngàn concert hot nhất từ các nghệ sĩ hàng đầu. Đặt
              vé nhanh chóng, an toàn và bắt đầu hành trình ngay.
            </p>
          </div>

          {/* <div className="relative w-full max-w-lg mx-auto group/search transition-all duration-300">
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
          </div> */}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <div className="group/feat flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover/feat:scale-110 transition-transform">
                <Headphones className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] leading-none mb-1">
                  Dịch vụ
                </div>
                <div className="text-xs font-bold text-white/80">
                  Hỗ trợ 24/7
                </div>
              </div>
            </div>

            <div className="group/feat flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover/feat:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] leading-none mb-1">
                  Giao dịch
                </div>
                <div className="text-xs font-bold text-white/80">
                  Thanh toán an toàn
                </div>
              </div>
            </div>

            <div className="group/feat flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover/feat:scale-110 transition-transform">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] leading-none mb-1">
                  Tiện ích
                </div>
                <div className="text-xs font-bold text-white/80">
                  Vé điện tử nhanh
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div>
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Sự kiện Đang mở bán{" "}
              <span className="text-sm font-normal text-foreground/50">
                ({total})
              </span>
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Xóa lọc
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 glass-card">
            {/* Month Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1 block">
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
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1 block">
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
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1 block">
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

            {/* Search (Secondary) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1 block">
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
