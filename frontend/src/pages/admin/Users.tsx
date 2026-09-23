import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { UserProfile } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton, EmptyState } from '../../components/common/FeedbackComponents';
import { formatDate } from '../../utils/format';
import { Users, Shield, User, Building2, Check, X, Search } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: UserProfile) => {
    try {
      await adminApi.toggleUserStatus(user.id);
      showToast('User status updated');
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !(u as any).isActive } : u))
      );
    } catch (err) {
      showToast('Failed to update user', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manage Platform Users</h2>
          <p className="text-xs text-slate-500">View and moderate all candidates, recruiters, and admins</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-52 bg-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 py-1.5 px-3 text-xs bg-white"
          >
            <option value="All">All Roles</option>
            <option value="JobSeeker">Job Seekers</option>
            <option value="Employer">Employers</option>
            <option value="Admin">Admins</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No Users Found" description="No users match the search criteria." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-xs">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                          u.role === 'Admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'Employer'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">{u.location || 'India'}</td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(u.createdAt)}</td>

                    <td className="px-6 py-4 text-right">
                      {u.role !== 'Admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                        >
                          Toggle Active
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
