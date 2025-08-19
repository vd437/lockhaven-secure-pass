import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Shield, Key, Activity, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { loadPasswords, loadActivity, loadStats } from '@/utils/storage';
import { PasswordEntry, ActivityLog, AppStats } from '@/types/password';

export const Dashboard = () => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<AppStats>({
    totalPasswords: 0,
    generatedCount: 0,
    averageStrength: 0,
    strongPasswords: 0,
    recentActivity: []
  });

  useEffect(() => {
    const loadData = () => {
      const loadedPasswords = loadPasswords();
      const loadedActivities = loadActivity();
      const loadedStats = loadStats();
      
      setPasswords(loadedPasswords);
      setActivities(loadedActivities);
      setStats(loadedStats);
    };

    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Prepare chart data
  const strengthData = [
    {
      name: 'ضعيف',
      count: passwords.filter(p => p.strength === 'weak').length,
      fill: 'hsl(var(--strength-weak))'
    },
    {
      name: 'متوسط',
      count: passwords.filter(p => p.strength === 'fair').length,
      fill: 'hsl(var(--strength-fair))'
    },
    {
      name: 'جيد',
      count: passwords.filter(p => p.strength === 'good').length,
      fill: 'hsl(var(--strength-good))'
    },
    {
      name: 'قوي',
      count: passwords.filter(p => p.strength === 'strong').length,
      fill: 'hsl(var(--strength-strong))'
    }
  ];

  // Activity timeline data (last 7 days)
  const getActivityData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
        fullDate: date.toDateString(),
        generated: 0,
        saved: 0,
        analyzed: 0
      };
    }).reverse();

    activities.forEach(activity => {
      const activityDate = activity.timestamp.toDateString();
      const dayData = last7Days.find(day => day.fullDate === activityDate);
      if (dayData) {
        if (activity.type === 'generate') dayData.generated++;
        else if (activity.type === 'save') dayData.saved++;
        else if (activity.type === 'analyze') dayData.analyzed++;
      }
    });

    return last7Days;
  };

  const activityData = getActivityData();

  const getStrengthPercentage = (strength: string) => {
    const count = passwords.filter(p => p.strength === strength).length;
    return passwords.length > 0 ? Math.round((count / passwords.length) * 100) : 0;
  };

  const averageStrengthScore = () => {
    if (passwords.length === 0) return 0;
    const strengthValues = { weak: 1, fair: 2, good: 3, strong: 4 };
    const total = passwords.reduce((sum, p) => sum + strengthValues[p.strength], 0);
    return Math.round((total / passwords.length) * 25); // Convert to percentage
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'generate': return <Key className="h-3 w-3" />;
      case 'save': return <Shield className="h-3 w-3" />;
      case 'analyze': return <TrendingUp className="h-3 w-3" />;
      case 'edit': return <Activity className="h-3 w-3" />;
      case 'delete': return <AlertTriangle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'generate': return 'text-blue-400';
      case 'save': return 'text-green-400';
      case 'analyze': return 'text-purple-400';
      case 'edit': return 'text-yellow-400';
      case 'delete': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          لوحة القيادة
        </h1>
        <p className="text-muted-foreground">
          نظرة شاملة على إحصائيات أمان كلمات المرور
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي كلمات المرور</p>
                <p className="text-2xl font-bold">{passwords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط القوة</p>
                <p className="text-2xl font-bold">{averageStrengthScore()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Key className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">كلمات مرور مولدة</p>
                <p className="text-2xl font-bold">{stats.generatedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Activity className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">النشاطات الأخيرة</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Strength Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              توزيع قوة كلمات المرور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={strengthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {strengthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [value, 'العدد']}
                    labelFormatter={(label: any) => `المستوى: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {strengthData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-card/50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              النشاط الأسبوعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="generated" fill="hsl(var(--primary))" name="مولد" />
                  <Bar dataKey="saved" fill="hsl(var(--success))" name="محفوظ" />
                  <Bar dataKey="analyzed" fill="hsl(var(--warning))" name="محلل" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            النشاطات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد نشاطات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activities.slice(0, 20).map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/30"
                >
                  <div className={`p-1.5 rounded-full bg-card/50 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {activity.type === 'generate' && 'توليد'}
                    {activity.type === 'save' && 'حفظ'}
                    {activity.type === 'analyze' && 'تحليل'}
                    {activity.type === 'edit' && 'تعديل'}
                    {activity.type === 'delete' && 'حذف'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            ملخص الأمان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {getStrengthPercentage('strong')}%
              </div>
              <p className="text-sm text-green-300">كلمات مرور قوية</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {getStrengthPercentage('fair') + getStrengthPercentage('good')}%
              </div>
              <p className="text-sm text-yellow-300">كلمات مرور متوسطة</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-400 mb-2">
                {getStrengthPercentage('weak')}%
              </div>
              <p className="text-sm text-red-300">كلمات مرور ضعيفة</p>
            </div>
          </div>
          
          {passwords.filter(p => p.strength === 'weak').length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="font-medium text-red-300">تحذير أمني</span>
              </div>
              <p className="text-sm text-red-200">
                لديك {passwords.filter(p => p.strength === 'weak').length} كلمة مرور ضعيفة. 
                ننصح بشدة بتحديثها لضمان أمان حساباتك.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};