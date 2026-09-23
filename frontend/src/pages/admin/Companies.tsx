import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Company } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton, EmptyState } from '../../components/common/FeedbackComponents';
import { Building2, ShieldCheck, ShieldAlert, Globe, MapPin } from 'lucide-react';

export const AdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getCompanies();
      if (res.success && res.data) {
        setCompanies(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load companies', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggleVerify = async (company: Company) => {
    try {
      await adminApi.toggleCompanyVerify(company.id);
      showToast(`Verification toggled for ${company.companyName}`);
      setCompanies((prev) =>
        prev.map((c) => (c.id === company.id ? { ...c, isVerified: !c.isVerified } : c))
      );
    } catch (err) {
      showToast('Failed to update verification', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manage Companies</h2>
        <p className="text-xs text-slate-500">Verify employers and inspect company accounts</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : companies.length === 0 ? (
        <EmptyState title="No Companies" description="No companies registered on the platform." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {c.logoUrl ? (
                      <img src={c.logoUrl} alt={c.companyName} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{c.companyName}</h4>
                      <p className="text-xs text-slate-500">{c.industry || 'Technology'}</p>
                    </div>
                  </div>

                  {c.isVerified ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Unverified
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">{c.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-3">
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {c.location || 'India'}</span>
                  <span>{c.companySize}</span>
                  <span>{c.activeJobsCount} Active Jobs</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleToggleVerify(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    c.isVerified
                      ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
                  }`}
                >
                  {c.isVerified ? 'Revoke Badge' : 'Verify Company'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
