import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home, Search } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-7xl font-black text-primary-600 tracking-tight">404</span>
      <h1 className="text-2xl font-black text-slate-900 mt-2">Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mt-2">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex items-center space-x-3 mt-6">
        <Link to="/">
          <Button leftIcon={<Home className="w-4 h-4" />}>Return Home</Button>
        </Link>
        <Link to="/jobs">
          <Button variant="outline" leftIcon={<Search className="w-4 h-4" />}>Browse Jobs</Button>
        </Link>
      </div>
    </div>
  );
};
