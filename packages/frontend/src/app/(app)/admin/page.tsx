'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, FileText, Briefcase, Brain, BarChart3 } from 'lucide-react';

export default function AdminPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiService.admin.stats().then(r => r.data.data),
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiService.admin.users().then(r => r.data.data),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  const adminStats = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600' },
    { label: 'Resumes', value: stats?.totalResumes || 0, icon: FileText, color: 'text-green-600' },
    { label: 'Applications', value: stats?.totalApplications || 0, icon: Briefcase, color: 'text-purple-600' },
    { label: 'Interviews', value: stats?.totalInterviews || 0, icon: Brain, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and analytics</p>
        </div>
        <Badge>Admin Access</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {adminStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <Icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">User Management</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users?.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                  <Badge variant={user.isVerified ? 'default' : 'outline'}>{user.isVerified ? 'Verified' : 'Pending'}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
