import { Users, UserCheck, UserX, DollarSign, Apple, Dumbbell, TrendingUp, Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { getStats, members, dietPlans, workouts } from '@/data/mockData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard = () => {
  const stats = getStats();

  const memberStatusData = [
    { name: 'Active', value: stats.activeMembers, color: 'hsl(142, 76%, 36%)' },
    { name: 'Expired', value: stats.expiredMembers, color: 'hsl(0, 84%, 60%)' },
    { name: 'Trial', value: stats.trialMembers, color: 'hsl(38, 92%, 50%)' },
  ];

  const workoutPopularityData = workouts
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5)
    .map(w => ({
      name: w.name.length > 15 ? w.name.substring(0, 15) + '...' : w.name,
      count: w.usageCount,
    }));

  const recentMembers = members.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your gym's performance."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          subtitle={`${Math.round((stats.activeMembers / stats.totalMembers) * 100)}% of total`}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Expired"
          value={stats.expiredMembers}
          subtitle="Need follow-up"
          icon={UserX}
          variant="destructive"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Member Status Distribution</CardTitle>
            <CardDescription>Breakdown of membership status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memberStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {memberStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {memberStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Workouts Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Workouts</CardTitle>
            <CardDescription>Most used workout routines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutPopularityData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Diet Plans"
          value={stats.totalDietPlans}
          subtitle={`${stats.assignedDietPlans} assigned`}
          icon={Apple}
        />
        <StatCard
          title="Workout Routines"
          value={stats.totalWorkouts}
          icon={Dumbbell}
        />
        <StatCard
          title="Avg Workout Duration"
          value={`${stats.avgWorkoutDuration} min`}
          icon={Clock}
        />
        <StatCard
          title="Growth Rate"
          value="+15%"
          subtitle="This quarter"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Recent Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Members</CardTitle>
          <CardDescription>Latest member activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.photo} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.plan}</p>
                  </div>
                </div>
                <StatusBadge status={member.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
