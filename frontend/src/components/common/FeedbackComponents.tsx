import React from 'react';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/4"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-full"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          </div>
          <div className="flex space-x-2 pt-2">
            <div className="h-6 bg-slate-100 rounded-full w-20"></div>
            <div className="h-6 bg-slate-100 rounded-full w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 my-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        if (
          page === 1 ||
          page === totalPages ||
          (page >= currentPage - 1 && page <= currentPage + 1)
        ) {
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition ${
                currentPage === page
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          );
        } else if (
          page === currentPage - 2 ||
          page === currentPage + 2
        ) {
          return (
            <span key={page} className="px-1 text-slate-400">
              ...
            </span>
          );
        }
        return null;
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
