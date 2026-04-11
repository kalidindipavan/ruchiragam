import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ShieldAlert, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '../../lib/apiClient';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function ManageUsers() {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers', roleFilter],
    queryFn: async () => {
      const params: any = { limit: 100 };
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const { data } = await apiClient.get('/users', { params });
      return data.data;
    },
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await apiClient.patch(`/users/${userId}`, { role: newRole });
      toast.success(`User promoted to ${newRole}`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSuspension = async (user: any) => {
    const action = user.is_active ? 'suspend' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.full_name || 'this user'}?`)) return;

    setUpdatingId(user.id);
    try {
      await apiClient.patch(`/users/${user.id}`, { is_active: !user.is_active });
      toast.success(`Account successfully ${action}ed`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">
          User Management
        </h1>
        
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-subtle)]">
          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ml-2">Filter Role:</label>
          <select 
            className="text-sm font-medium px-3 py-1.5 rounded-md border-none bg-[var(--bg-card)] focus:ring-1 focus:ring-[var(--saffron-500)] appearance-none cursor-pointer outline-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins Only</option>
            <option value="seller">Sellers Only</option>
            <option value="user">Customers Only</option>
          </select>
        </div>
      </div>

      <Card className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[var(--bg-card)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 rounded-tr-xl font-bold flex justify-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--saffron-500)]" />
                  </td>
                </tr>
              ) : usersData?.users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No users registered yet.
                  </td>
                </tr>
              ) : (
                usersData?.users?.map((user: any) => (
                  <tr key={user.id} className={`border-b border-[var(--border-subtle)] transition ${!user.is_active ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-[var(--bg-card)]'}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--text-primary)] relative">
                          {user.full_name || 'Guest User'}
                          {!user.is_active && <span className="ml-2 text-[10px] text-red-500 font-bold border border-red-500/30 px-1 rounded uppercase tracking-wider">Banned</span>}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">{user.email}</div>
                      {user.phone && <div className="text-xs text-[var(--text-muted)]">{user.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--saffron-500)] appearance-none cursor-pointer text-center 
                            ${user.role === 'admin' ? 'text-red-400 border-red-500/50 bg-red-500/10' : 
                              user.role === 'seller' ? 'text-purple-400 border-purple-500/50 bg-purple-500/10' : 
                              'text-blue-400 border-blue-500/50 bg-blue-500/10'}`}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                      >
                        <option value="user" className="bg-[var(--bg-elevated)] text-blue-400">User</option>
                        <option value="seller" className="bg-[var(--bg-elevated)] text-purple-400">Seller</option>
                        <option value="admin" className="bg-[var(--bg-elevated)] text-red-400">Admin</option>
                      </select>
                      {updatingId === user.id && <Loader2 className="h-3 w-3 animate-spin inline-block ml-2 text-[var(--saffron-500)]" />}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                        {new Date(user.created_at).toLocaleDateString()}<br/>
                        <span className="text-xs opacity-70">Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={user.is_active ? 'text-green-400 border-green-500/50 bg-green-500/10 shadow-sm' : 'text-zinc-400 border-zinc-500/50 bg-zinc-500/10 line-through'}>
                        {user.is_active ? 'ACTIVE' : 'SUSPENDED'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleSuspension(user)} 
                          className={`px-3 ${user.is_active ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'}`}
                          title={user.is_active ? "Suspend User" : "Reactivate User"}
                          disabled={updatingId === user.id}
                        >
                          {user.is_active ? <UserX className="h-4 w-4 mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />} 
                          {user.is_active ? 'Suspend' : 'Unban'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
