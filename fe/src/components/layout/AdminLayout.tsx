import { Outlet, Link, useLocation } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Music,
  Ticket,
  Tag,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { toast } from "sonner";

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Đăng xuất thành công!");
    window.location.href = "/login";
  };

  const navItems = [
    { name: "Tổng quan", path: "/admin", icon: LayoutDashboard },
    { name: "Quản lý Concert", path: "/admin/concerts", icon: Music },
    { name: "Quản lý Đặt vé", path: "/admin/bookings", icon: Ticket },
    { name: "Mã Giảm giá", path: "/admin/vouchers", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-72 glass-card rounded-none border-y-0 border-l-0 flex flex-col h-screen sticky top-0">
        <div className="h-20 flex items-center px-6 border-b border-foreground/[0.05]">
          <img
            src="/logo.png"
            alt="Melotix Logo"
            className="w-12 h-12 rounded-lg object-contain mr-3"
          />
          <span className="font-bold text-xl text-foreground tracking-wide">
            Melotix Admin
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-violet-600/20 text-foreground border border-violet-500/30 font-semibold"
                    : "text-foreground/60 hover:bg-[var(--glass-hover)] hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("w-5 h-5", isActive ? "text-violet-400" : "")}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-foreground/[0.05]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-foreground/50 hover:text-foreground text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Khách
            </Link>
            <ThemeToggle />
          </div>
          <div className="glass-card p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <span className="text-violet-300 font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-foreground/50 truncate">
                Quản trị viên
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-foreground/40 hover:text-red-400 p-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto beautiful-scrollbar">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
