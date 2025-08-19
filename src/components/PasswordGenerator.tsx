import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dices, Copy, Save, RefreshCw } from 'lucide-react';
import { PasswordGeneratorOptions } from '@/types/password';
import { generateMultiplePasswords, analyzePassword } from '@/utils/passwordGenerator';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { useToast } from '@/hooks/use-toast';
import { addActivity } from '@/utils/storage';

export const PasswordGenerator = () => {
  const { toast } = useToast();
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    count: 1
  });
  
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePasswords = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for animation
      const passwords = generateMultiplePasswords(options);
      setGeneratedPasswords(passwords);
      
      addActivity({
        type: 'generate',
        description: `تم توليد ${passwords.length} كلمة مرور`
      });
      
      toast({
        title: "✨ تم توليد كلمات المرور",
        description: `تم إنشاء ${passwords.length} كلمة مرور بنجاح`,
      });
    } catch (error) {
      toast({
        title: "❌ خطأ في التوليد",
        description: "حدث خطأ أثناء توليد كلمات المرور",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "📋 تم النسخ",
        description: "تم نسخ كلمة المرور إلى الحافظة",
      });
    } catch (error) {
      toast({
        title: "❌ فشل النسخ",
        description: "لم يتم نسخ كلمة المرور",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    generatePasswords();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Dices className="h-6 w-6 text-primary" />
            مولد كلمات المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Length Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>طول كلمة المرور</Label>
              <Badge variant="secondary">{options.length} حرف</Badge>
            </div>
            <Slider
              value={[options.length]}
              onValueChange={([value]) => setOptions(prev => ({ ...prev, length: value }))}
              max={50}
              min={4}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Character Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
              <Label htmlFor="uppercase" className="text-sm font-medium">أحرف كبيرة (A-Z)</Label>
              <Switch
                id="uppercase"
                checked={options.includeUppercase}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeUppercase: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
              <Label htmlFor="lowercase" className="text-sm font-medium">أحرف صغيرة (a-z)</Label>
              <Switch
                id="lowercase"
                checked={options.includeLowercase}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeLowercase: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
              <Label htmlFor="numbers" className="text-sm font-medium">أرقام (0-9)</Label>
              <Switch
                id="numbers"
                checked={options.includeNumbers}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeNumbers: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
              <Label htmlFor="symbols" className="text-sm font-medium">رموز خاصة (!@#$)</Label>
              <Switch
                id="symbols"
                checked={options.includeSymbols}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeSymbols: checked }))}
              />
            </div>
          </div>

          <Separator />

          {/* Advanced Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
              <Label htmlFor="similar" className="text-sm font-medium">استبعاد الأحرف المتشابهة</Label>
              <Switch
                id="similar"
                checked={options.excludeSimilar}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, excludeSimilar: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
              <Label htmlFor="ambiguous" className="text-sm font-medium">استبعاد الأحرف الغامضة</Label>
              <Switch
                id="ambiguous"
                checked={options.excludeAmbiguous}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, excludeAmbiguous: checked }))}
              />
            </div>
          </div>

          <Separator />

          {/* Count */}
          <div className="space-y-3">
            <Label htmlFor="count">عدد كلمات المرور</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={10}
              value={options.count}
              onChange={(e) => setOptions(prev => ({ ...prev, count: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) }))}
              className="ltr text-left"
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generatePasswords} 
            className="w-full btn-primary"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                جاري التوليد...
              </>
            ) : (
              <>
                <Dices className="ml-2 h-4 w-4" />
                توليد كلمات مرور جديدة
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Passwords */}
      {generatedPasswords.length > 0 && (
        <Card className="glow-card">
          <CardHeader>
            <CardTitle className="text-lg">كلمات المرور المولدة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedPasswords.map((password, index) => {
              const analysis = analyzePassword(password);
              return (
                <div key={index} className="space-y-3 p-4 rounded-lg bg-card/50 border border-border/50">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm ltr text-left font-mono break-all">
                      {password}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(password)}
                      className="btn-glass"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <PasswordStrengthIndicator 
                    strength={analysis.strength}
                    score={analysis.score}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};