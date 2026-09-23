import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Briefcase, Building2, User, Lock, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'Employer' ? 'Employer' : 'JobSeeker';
  const [role, setRole] = useState<'JobSeeker' | 'Employer'>(initialRole);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('Information Technology');

  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        confirmPassword,
        role,
        phone,
        location,
        companyName: role === 'Employer' ? companyName : undefined,
        companyWebsite: role === 'Employer' ? companyWebsite : undefined,
        industry: role === 'Employer' ? industry : undefined,
      });

      showToast('Registration successful! Welcome to CareerPulse.');
      if (role === 'Employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join thousands of job seekers and verified companies</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('JobSeeker')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              role === 'JobSeeker'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4 text-primary-600" />
            <span>Job Seeker</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('Employer')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              role === 'Employer'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Company / Employer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Full Name or Contact Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {role === 'Employer' ? 'Contact Person Name' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === 'Employer' ? 'e.g. Arun Verma' : 'e.g. Rahul Sharma'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          {/* Company Specific Fields */}
          {role === 'Employer' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp Solutions"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  >
                    <option value="Information Technology">IT / Software</option>
                    <option value="Fintech">Fintech</option>
                    <option value="SaaS & Cloud Computing">SaaS & Cloud</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="E-Commerce">E-Commerce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Phone & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-3">
            Register as {role === 'Employer' ? 'Company' : 'Job Seeker'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
