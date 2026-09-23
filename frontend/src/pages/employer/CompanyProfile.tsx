import React, { useState, useEffect } from 'react';
import { companiesApi } from '../../api/companiesApi';
import { Company } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Building2, Upload, Globe, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';

export const CompanyProfilePage: React.FC = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const { showToast } = useToast();

  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const fetchCompany = async () => {
    setIsLoading(true);
    try {
      const res = await companiesApi.getMyCompany();
      if (res.success && res.data) {
        setCompany(res.data);
        setCompanyName(res.data.companyName || '');
        setDescription(res.data.description || '');
        setIndustry(res.data.industry || 'Information Technology');
        setCompanySize(res.data.companySize || '50-100 employees');
        setWebsite(res.data.website || '');
        setLocation(res.data.location || '');
        setContactPhone(res.data.contactPhone || '');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load company profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await companiesApi.updateCompanyProfile({
        companyName,
        description,
        industry,
        companySize,
        website,
        location,
        contactPhone,
      });

      if (res.success) {
        showToast('Company profile updated successfully!');
        setCompany(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update company profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsUploadingLogo(true);
    try {
      const res = await companiesApi.uploadLogo(file);
      if (res.success) {
        showToast('Company logo updated!');
        await fetchCompany();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload logo', 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm animate-pulse space-y-6">
        <div className="h-20 w-20 bg-slate-200 rounded-2xl"></div>
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Company Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative group">
          {company?.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.companyName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-3xl">
              <Building2 className="w-10 h-10" />
            </div>
          )}

          <label
            htmlFor="logo-upload"
            className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer transition"
            title="Upload Logo"
          >
            <Upload className="w-4 h-4" />
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <h2 className="text-2xl font-black text-slate-900">{company?.companyName}</h2>
            {company?.isVerified && (
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500">{company?.industry} • {company?.companySize}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-2">
            {company?.location && (
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {company.location}
              </span>
            )}
            {company?.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center text-primary-600 hover:underline">
                <Globe className="w-3.5 h-3.5 mr-1 text-primary-400" /> {company.website.replace('https://', '')}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleUpdate} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          Company Details & Branding
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company Name
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Information Technology">Information Technology</option>
              <option value="SaaS & Cloud Computing">SaaS & Cloud Computing</option>
              <option value="Fintech">Fintech</option>
              <option value="Software Development">Software Development</option>
              <option value="Healthcare">Healthcare</option>
              <option value="E-Commerce">E-Commerce</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Company Size
            </label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="1-10 employees">1-10 employees</option>
              <option value="10-50 employees">10-50 employees</option>
              <option value="50-100 employees">50-100 employees</option>
              <option value="100-250 employees">100-250 employees</option>
              <option value="250-500 employees">250-500 employees</option>
              <option value="500-1000 employees">500-1000 employees</option>
              <option value="1000+ employees">1000+ employees</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Headquarters / Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bangalore, Karnataka"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 9845012345"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Company Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your company, mission, culture, and what makes working here exceptional..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isSaving} size="md" className="px-8">
            Save Company Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
