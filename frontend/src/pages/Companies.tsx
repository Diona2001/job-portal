import React, { useState, useEffect } from 'react';
import { companiesApi } from '../api/companiesApi';
import { Company } from '../types';
import { Building2, MapPin, Globe, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSkeleton, EmptyState } from '../components/common/FeedbackComponents';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const res = await companiesApi.getCompanies();
        if (res.success && res.data) {
          setCompanies(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore Top Hiring Companies
        </h1>
        <p className="text-sm text-slate-600">
          Discover verified engineering teams, SaaS innovators, and enterprise leaders building the future.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : companies.length === 0 ? (
        <EmptyState title="No Companies Found" description="Check back soon as more employers join." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {c.logoUrl ? (
                      <img
                        src={c.logoUrl}
                        alt={c.companyName}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                        <Building2 className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-base font-bold text-slate-900">{c.companyName}</h3>
                        {c.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <span className="text-xs text-slate-400">{c.industry || 'Technology'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-500 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-slate-400">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> Location
                    </span>
                    <span className="font-semibold">{c.location || 'India'}</span>
                  </div>
                  {c.companySize && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-400">
                        <Users className="w-3.5 h-3.5 mr-1 text-slate-400" /> Size
                      </span>
                      <span className="font-semibold">{c.companySize}</span>
                    </div>
                  )}
                  {c.website && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-400">
                        <Globe className="w-3.5 h-3.5 mr-1 text-slate-400" /> Website
                      </span>
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:underline font-semibold"
                      >
                        Visit site
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-primary-600">
                  {c.activeJobsCount} Open Roles
                </span>
                <Link
                  to={`/jobs?keyword=${encodeURIComponent(c.companyName)}`}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-primary-600 hover:text-white text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                >
                  <span>View Jobs</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
