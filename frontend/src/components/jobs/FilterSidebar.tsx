import React from 'react';
import { JobFilterParams } from '../../types';
import { Filter, RotateCcw } from 'lucide-react';

interface Props {
  filters: JobFilterParams;
  onChange: (newFilters: JobFilterParams) => void;
  onClear: () => void;
}

export const FilterSidebar: React.FC<Props> = ({ filters, onChange, onClear }) => {
  const handleChange = (key: keyof JobFilterParams, value: any) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2 font-bold text-slate-800">
          <Filter className="w-4 h-4 text-primary-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-medium text-slate-500 hover:text-primary-600 flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Workplace Type */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Workplace Type
        </label>
        <div className="space-y-2">
          {['All', 'Remote', 'Hybrid', 'Onsite'].map((type) => (
            <label key={type} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="workplaceType"
                checked={(filters.workplaceType || 'All') === type}
                onChange={() => handleChange('workplaceType', type === 'All' ? '' : type)}
                className="text-primary-600 focus:ring-primary-500 rounded-full"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Job Type
        </label>
        <div className="space-y-2">
          {['All', 'FullTime', 'PartTime', 'Contract', 'Internship'].map((type) => (
            <label key={type} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="employmentType"
                checked={(filters.employmentType || 'All') === type}
                onChange={() => handleChange('employmentType', type === 'All' ? '' : type)}
                className="text-primary-600 focus:ring-primary-500 rounded-full"
              />
              <span>{type === 'FullTime' ? 'Full Time' : type === 'PartTime' ? 'Part Time' : type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Experience Level
        </label>
        <div className="space-y-2">
          {['All', 'Entry', 'Mid', 'Senior', 'Lead'].map((exp) => (
            <label key={exp} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="experienceLevel"
                checked={(filters.experienceLevel || 'All') === exp}
                onChange={() => handleChange('experienceLevel', exp === 'All' ? '' : exp)}
                className="text-primary-600 focus:ring-primary-500 rounded-full"
              />
              <span>{exp} Level</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Posted */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Date Posted
        </label>
        <div className="space-y-2">
          {[
            { label: 'Anytime', val: '' },
            { label: 'Past 24 hours', val: '24h' },
            { label: 'Past week', val: '7d' },
            { label: 'Past month', val: '30d' },
          ].map((item) => (
            <label key={item.val} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
              <input
                type="radio"
                name="datePosted"
                checked={(filters.datePosted || '') === item.val}
                onChange={() => handleChange('datePosted', item.val)}
                className="text-primary-600 focus:ring-primary-500 rounded-full"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Salary */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Min Salary (₹ Annual)
        </label>
        <select
          value={filters.minSalary || ''}
          onChange={(e) => handleChange('minSalary', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full text-sm border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Any Salary</option>
          <option value="500000">₹5 Lakhs +</option>
          <option value="1000000">₹10 Lakhs +</option>
          <option value="1500000">₹15 Lakhs +</option>
          <option value="2500000">₹25 Lakhs +</option>
        </select>
      </div>
    </div>
  );
};
