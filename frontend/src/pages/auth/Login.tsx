import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Briefcase, Lock, Mail, ArrowRight, Shield, User, Building2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Logged in successfully!');

      // Redirect based on role
      const stored = localStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      if (from) {
        navigate(from, { replace: true });
      } else if (user?.role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'Employer') {
        navigate('/employer/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your dashboard and manage applications
          </p>
        </div>

        {/* Demo One-Click Login Bar */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            ⚡ Quick Demo Accounts (Click to Fill)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@jobportal.com', 'Admin@123')}
              className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-purple-700 hover:bg-purple-50 transition shadow-xs flex items-center justify-center space-x-1"
            >
              <Shield className="w-3 h-3 text-purple-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('arun@techcorp.in', 'Password@123')}
              className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-indigo-700 hover:bg-indigo-50 transition shadow-xs flex items-center justify-center space-x-1"
            >
              <Building2 className="w-3 h-3 text-indigo-600" />
              <span>Employer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('rahul.sharma@example.com', 'Password@123')}
              className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50 transition shadow-xs flex items-center justify-center space-x-1"
            >
              <User className="w-3 h-3 text-emerald-600" />
              <span>Seeker</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => showToast('Password reset link sent to registered email', 'info')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-800"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-3"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
