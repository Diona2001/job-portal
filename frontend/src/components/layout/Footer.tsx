import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Globe, Shield, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight">
                Career<span className="text-primary-400">Pulse</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering top tech talent and progressive companies across Bangalore, Hyderabad, Mumbai, Kochi, Pune, and remote teams worldwide.
            </p>
            <div className="pt-2 text-xs text-slate-500 space-y-1">
              <p className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-primary-400" />
                <span>Indiranagar 100ft Rd, Bangalore 560038</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-primary-400" />
                <span>support@careerpulse.in</span>
              </p>
            </div>
          </div>

          {/* Col 2: Job Seekers */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Job Seekers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/jobs" className="hover:text-primary-400 transition">Browse All Jobs</Link></li>
              <li><Link to="/jobs?workplaceType=Remote" className="hover:text-primary-400 transition">Remote Opportunities</Link></li>
              <li><Link to="/companies" className="hover:text-primary-400 transition">Top Companies</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-400 transition">Seeker Dashboard</Link></li>
              <li><Link to="/saved-jobs" className="hover:text-primary-400 transition">Saved Jobs</Link></li>
            </ul>
          </div>

          {/* Col 3: Employers */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Employers</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/employer/jobs/new" className="hover:text-primary-400 transition">Post a New Job</Link></li>
              <li><Link to="/employer/dashboard" className="hover:text-primary-400 transition">Employer Dashboard</Link></li>
              <li><Link to="/employer/candidates" className="hover:text-primary-400 transition">Candidate Pipeline</Link></li>
              <li><Link to="/employer/profile" className="hover:text-primary-400 transition">Company Branding</Link></li>
              <li><Link to="/register?role=Employer" className="hover:text-primary-400 transition">Hire Talent</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-emerald-400 font-semibold text-xs">ASP.NET Core 8 Web API</span></li>
              <li><span className="text-blue-400 font-semibold text-xs">React 18 + TypeScript</span></li>
              <li><span className="text-cyan-400 font-semibold text-xs">Tailwind CSS + Vite</span></li>
              <li><span className="text-amber-400 font-semibold text-xs">Microsoft SQL Server</span></li>
              <li><Link to="/admin/dashboard" className="hover:text-primary-400 transition text-xs">Admin Management</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} CareerPulse. Built with ASP.NET Core & React.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
