import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { Music, ArrowRight, Loader2, Home, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi đăng nhập");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-fade-in-up z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground mb-4 px-2 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Về trang chủ</span>
        </Link>

        <div className="glass-card p-8">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/Melotix-logo.png"
              alt="Melotix Logo"
              className="w-28 h-22 object-cover mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground tracking-wide">
              Chào mừng trở lại
            </h1>
            <p className="text-foreground/50 text-sm mt-2">
              Đăng nhập để tiếp tục đến Melotix
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Đăng nhập"
              )}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
            <p className="text-sm text-foreground/50">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
