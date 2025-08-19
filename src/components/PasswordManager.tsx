import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, Edit, Trash2, Copy, Eye, EyeOff, Globe, User } from 'lucide-react';
import { PasswordEntry, PasswordStrength } from '@/types/password';
import { loadPasswords, savePasswords, addActivity, updateStats } from '@/utils/storage';
import { analyzePassword } from '@/utils/passwordGenerator';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useToast } from '@/hooks/use-toast';

export const PasswordManager = () => {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStrength, setFilterStrength] = useState<PasswordStrength | 'all'>('all');
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    password: '',
    username: '',
    website: '',
    notes: ''
  });

  useEffect(() => {
    setPasswords(loadPasswords());
  }, []);

  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.website?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStrength === 'all' || password.strength === filterStrength;
    return matchesSearch && matchesFilter;
  });

  const resetForm = () => {
    setFormData({
      title: '',
      password: '',
      username: '',
      website: '',
      notes: ''
    });
    setEditingPassword(null);
  };

  const openDialog = (password?: PasswordEntry) => {
    if (password) {
      setEditingPassword(password);
      setFormData({
        title: password.title,
        password: password.password,
        username: password.username || '',
        website: password.website || '',
        notes: password.notes || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const savePassword = () => {
    if (!formData.title || !formData.password) {
      toast({
        title: "❌ بيانات ناقصة",
        description: "يرجى إدخال العنوان وكلمة المرور",
        variant: "destructive"
      });
      return;
    }

    const analysis = analyzePassword(formData.password);
    const now = new Date();

    if (editingPassword) {
      // Update existing password
      const updatedPasswords = passwords.map(p => 
        p.id === editingPassword.id
          ? {
              ...p,
              ...formData,
              strength: analysis.strength,
              updatedAt: now
            }
          : p
      );
      setPasswords(updatedPasswords);
      savePasswords(updatedPasswords);
      
      addActivity({
        type: 'edit',
        description: `تم تعديل كلمة مرور "${formData.title}"`
      });
      
      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث كلمة المرور بنجاح",
      });
    } else {
      // Add new password
      const newPassword: PasswordEntry = {
        id: Date.now().toString(),
        ...formData,
        strength: analysis.strength,
        createdAt: now,
        updatedAt: now
      };
      
      const updatedPasswords = [...passwords, newPassword];
      setPasswords(updatedPasswords);
      savePasswords(updatedPasswords);
      
      addActivity({
        type: 'save',
        description: `تم حفظ كلمة مرور "${formData.title}"`
      });
      
      toast({
        title: "✅ تم الحفظ",
        description: "تم حفظ كلمة المرور بنجاح",
      });
    }

    updateStats();
    closeDialog();
  };

  const deletePassword = (id: string) => {
    const passwordToDelete = passwords.find(p => p.id === id);
    const updatedPasswords = passwords.filter(p => p.id !== id);
    setPasswords(updatedPasswords);
    savePasswords(updatedPasswords);
    
    if (passwordToDelete) {
      addActivity({
        type: 'delete',
        description: `تم حذف كلمة مرور "${passwordToDelete.title}"`
      });
    }
    
    updateStats();
    toast({
      title: "🗑️ تم الحذف",
      description: "تم حذف كلمة المرور",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "📋 تم النسخ",
        description: "تم نسخ النص إلى الحافظة",
      });
    } catch (error) {
      toast({
        title: "❌ فشل النسخ",
        description: "لم يتم نسخ النص",
        variant: "destructive"
      });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    const newVisiblePasswords = new Set(visiblePasswords);
    if (newVisiblePasswords.has(id)) {
      newVisiblePasswords.delete(id);
    } else {
      newVisiblePasswords.add(id);
    }
    setVisiblePasswords(newVisiblePasswords);
  };

  const strengthCounts = {
    all: passwords.length,
    weak: passwords.filter(p => p.strength === 'weak').length,
    fair: passwords.filter(p => p.strength === 'fair').length,
    good: passwords.filter(p => p.strength === 'good').length,
    strong: passwords.filter(p => p.strength === 'strong').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">إدارة كلمات المرور</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} className="btn-primary">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة كلمة مرور
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPassword ? 'تعديل كلمة المرور' : 'إضافة كلمة مرور جديدة'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">العنوان *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="مثال: Gmail"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">الموقع الإلكتروني</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://example.com"
                        className="ltr text-left"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">اسم المستخدم</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="user@example.com"
                        className="ltr text-left"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="كلمة المرور"
                        className="ltr text-left"
                      />
                    </div>
                  </div>
                  
                  {formData.password && (
                    <PasswordStrengthIndicator 
                      strength={analyzePassword(formData.password).strength}
                      score={analyzePassword(formData.password).score}
                    />
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="ملاحظات إضافية..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={savePassword} className="btn-primary flex-1">
                      {editingPassword ? 'تحديث' : 'حفظ'}
                    </Button>
                    <Button onClick={closeDialog} variant="outline" className="btn-glass">
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في كلمات المرور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 h-11 text-base"
              />
            </div>
            
            <Select value={filterStrength} onValueChange={(value: any) => setFilterStrength(value)}>
              <SelectTrigger className="w-full sm:w-48 h-11">
                <SelectValue placeholder="تصفية حسب القوة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات ({strengthCounts.all})</SelectItem>
                <SelectItem value="strong">قوي ({strengthCounts.strong})</SelectItem>
                <SelectItem value="good">جيد ({strengthCounts.good})</SelectItem>
                <SelectItem value="fair">متوسط ({strengthCounts.fair})</SelectItem>
                <SelectItem value="weak">ضعيف ({strengthCounts.weak})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-card/50">
              <div className="text-xl sm:text-2xl font-bold text-primary">{passwords.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">إجمالي كلمات المرور</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card/50">
              <div className="text-xl sm:text-2xl font-bold text-green-400">{strengthCounts.strong}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">كلمات مرور قوية</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card/50">
              <div className="text-xl sm:text-2xl font-bold text-red-400">{strengthCounts.weak}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">كلمات مرور ضعيفة</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-card/50">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">{filteredPasswords.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">نتائج البحث</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passwords List */}
      <div className="space-y-4">
        {filteredPasswords.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">لا توجد كلمات مرور</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm || filterStrength !== 'all' 
                  ? 'لم يتم العثور على نتائج مطابقة للبحث'
                  : 'ابدأ بإضافة كلمات المرور الخاصة بك'
                }
              </p>
              {!searchTerm && filterStrength === 'all' && (
                <Button onClick={() => openDialog()} className="btn-primary">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة كلمة مرور جديدة
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPasswords.map((password) => (
            <Card key={password.id} className="glass-card hover:glow-card transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{password.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {password.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span className="ltr">{password.website}</span>
                        </div>
                      )}
                      {password.username && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="ltr">{password.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openDialog(password)}
                      className="btn-glass"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePassword(password.id)}
                      className="btn-glass text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <PasswordStrengthIndicator 
                    strength={password.strength}
                    score={analyzePassword(password.password).score}
                  />
                  
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm ltr text-left font-mono">
                      {visiblePasswords.has(password.id) 
                        ? password.password 
                        : '••••••••••••••••'
                      }
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="btn-glass"
                    >
                      {visiblePasswords.has(password.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(password.password)}
                      className="btn-glass"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {password.notes && (
                    <div className="p-2 bg-muted/50 rounded text-sm">
                      <strong>ملاحظات:</strong> {password.notes}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    تم الإنشاء: {password.createdAt.toLocaleDateString('ar-SA')} | 
                    آخر تحديث: {password.updatedAt.toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};