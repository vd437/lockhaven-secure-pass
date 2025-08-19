import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SearchCheck, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { analyzePassword } from '@/utils/passwordGenerator';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { addActivity } from '@/utils/storage';
import { useToast } from '@/hooks/use-toast';

export const PasswordAnalyzer = () => {
  const { toast } = useToast();
  const [passwordToAnalyze, setPasswordToAnalyze] = useState('');
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePassword> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const performAnalysis = async () => {
    if (!passwordToAnalyze.trim()) {
      toast({
        title: "❌ لا توجد كلمة مرور",
        description: "يرجى إدخال كلمة مرور للتحليل",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = analyzePassword(passwordToAnalyze);
    setAnalysis(result);
    setIsAnalyzing(false);
    
    addActivity({
      type: 'analyze',
      description: `تم تحليل كلمة مرور بقوة ${result.strength}`
    });

    toast({
      title: "🔍 تم التحليل",
      description: "تم تحليل كلمة المرور بنجاح",
    });
  };

  const getStrengthDescription = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'كلمة المرور ضعيفة ويمكن كسرها بسهولة. ننصح بتغييرها فوراً.';
      case 'fair':
        return 'كلمة المرور متوسطة القوة. يمكن تحسينها لزيادة الأمان.';
      case 'good':
        return 'كلمة المرور جيدة وتوفر حماية معقولة.';
      case 'strong':
        return 'كلمة المرور قوية جداً وتوفر حماية ممتازة!';
      default:
        return '';
    }
  };

  const securityTips = [
    'استخدم كلمة مرور مختلفة لكل حساب',
    'تجنب استخدام المعلومات الشخصية في كلمات المرور',
    'قم بتحديث كلمات المرور بانتظام',
    'استخدم مدير كلمات مرور موثوق',
    'فعّل المصادقة الثنائية حيثما أمكن',
    'لا تشارك كلمات المرور مع الآخرين'
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <SearchCheck className="h-6 w-6 text-primary" />
            محلل قوة كلمات المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">
              أدخل كلمة المرور للتحليل
            </label>
            <Textarea
              value={passwordToAnalyze}
              onChange={(e) => setPasswordToAnalyze(e.target.value)}
              placeholder="أدخل كلمة المرور هنا..."
              className="min-h-[100px] ltr text-left font-mono"
              rows={4}
            />
          </div>

          <Button 
            onClick={performAnalysis}
            disabled={isAnalyzing || !passwordToAnalyze.trim()}
            className="w-full btn-primary"
          >
            {isAnalyzing ? (
              <>
                <SearchCheck className="ml-2 h-4 w-4 animate-pulse" />
                جاري التحليل...
              </>
            ) : (
              <>
                <SearchCheck className="ml-2 h-4 w-4" />
                تحليل كلمة المرور
              </>
            )}
          </Button>

          {analysis && (
            <div className="space-y-6 animate-fade-in">
              <Separator />
              
              {/* Strength Score */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">نتيجة التحليل</h3>
                
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <PasswordStrengthIndicator 
                    strength={analysis.strength}
                    score={analysis.score}
                  />
                  
                  <p className="mt-3 text-sm text-muted-foreground">
                    {getStrengthDescription(analysis.strength)}
                  </p>
                </div>
              </div>

              {/* Feedback */}
              {analysis.feedback.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    ملاحظات
                  </h4>
                  <div className="space-y-2">
                    {analysis.feedback.map((feedback, index) => (
                      <Alert key={index}>
                        <AlertDescription className="flex items-center gap-2">
                          {analysis.strength === 'strong' ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <XCircle className="h-4 w-4 text-warning" />
                          )}
                          {feedback}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    اقتراحات للتحسين
                  </h4>
                  <div className="grid gap-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20"
                      >
                        <Badge variant="outline" className="bg-primary/10">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Password Details */}
              <div className="space-y-3">
                <h4 className="font-medium">تفاصيل كلمة المرور</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-card/50 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {passwordToAnalyze.length}
                    </div>
                    <div className="text-sm text-muted-foreground">طول كلمة المرور</div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-card/50 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {analysis.score}
                    </div>
                    <div className="text-sm text-muted-foreground">النقاط</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span>أحرف كبيرة:</span>
                    <Badge variant={/[A-Z]/.test(passwordToAnalyze) ? "default" : "secondary"}>
                      {/[A-Z]/.test(passwordToAnalyze) ? "✓" : "✗"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span>أحرف صغيرة:</span>
                    <Badge variant={/[a-z]/.test(passwordToAnalyze) ? "default" : "secondary"}>
                      {/[a-z]/.test(passwordToAnalyze) ? "✓" : "✗"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span>أرقام:</span>
                    <Badge variant={/\d/.test(passwordToAnalyze) ? "default" : "secondary"}>
                      {/\d/.test(passwordToAnalyze) ? "✓" : "✗"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between p-2 rounded bg-muted/50">
                    <span>رموز خاصة:</span>
                    <Badge variant={/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordToAnalyze) ? "default" : "secondary"}>
                      {/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordToAnalyze) ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            نصائح الأمان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {securityTips.map((tip, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/30"
              >
                <Badge variant="outline" className="mt-0.5 bg-primary/10 text-primary">
                  {index + 1}
                </Badge>
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};