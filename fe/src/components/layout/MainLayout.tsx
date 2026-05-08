import { Outlet, Link, useLocation } from 'react-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { LogOut, Ticket, Music, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ThemeToggle from './ThemeToggle';

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công!');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-violet-900/20 to-transparent pointer-events-none -z-10" />
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass-card rounded-none border-t-0 border-x-0 border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/Melotix-logo.png" 
                alt="Melotix Logo" 
                className="w-10 h-10 rounded-xl object-cover group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-2xl tracking-tight text-foreground group-hover:text-violet-400 transition-colors">
                Melotix
              </span>
            </Link>

            {/* Nav Links */}
            {user && (
              <nav className="hidden md:flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.05]">
                <Link
                  to="/"
                  className={cn(
                    location.pathname === '/' ? 'nav-link-active' : 'nav-link'
                  )}
                >
                  <Music className="w-4 h-4" /> Khám phá
                </Link>
                <Link
                  to="/my-bookings"
                  className={cn(
                    location.pathname === '/my-bookings' ? 'nav-link-active' : 'nav-link'
                  )}
                >
                  <Ticket className="w-4 h-4" /> Vé của tôi
                </Link>
              </nav>
            )}

            {/* Right section */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-4">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="btn-ghost !px-4 !py-2 text-sm">
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="flex items-center gap-3 pl-4 border-l border-foreground/10">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-foreground">{user.fullName}</span>
                      <span className="text-xs text-foreground/50">{user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all"
                      title="Đăng xuất"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="btn-ghost">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-foreground/[0.05] bg-[var(--bg-color)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-foreground/40">
            &copy; {new Date().getFullYear()} Melotix. Đồ án thiết kế Web.
          </p>
        </div>
      </footer>
    </div>
  );
}
