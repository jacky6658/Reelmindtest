import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, MessageSquare, Sparkles, User, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Premium() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    teamSize: "",
    useCase: "",
    additionalInfo: "",
  });

  const submitMutation = trpc.preorder.submit.useMutation({
    onSuccess: () => {
      toast.success("預購成功!我們會盡快與您聯繫");
      setFormSubmitted(true);
    },
    onError: (error: any) => {
      toast.error("提交失敗: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.teamSize || !formData.useCase) {
      toast.error("請填寫所有必填欄位");
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen gradient-bg py-12">
      <div className="container max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>

        {/* Hero */}
        <div className="text-center text-white mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Reelmind 完整版
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            解鎖全部功能,打造你的短影音帝國 🚀
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Feature 1 */}
          <Card className="card-gradient border-white/20">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-white text-2xl">
                AI 短影音顧問
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              <p className="mb-4">
                1對1 聊天對話,AI 顧問記憶你的內容,打造專屬你的社群短影音策略
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>無限次數對話諮詢</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>記憶你的風格與偏好</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>即時優化建議</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="card-gradient border-white/20">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-white text-2xl">
                一鍵生成完整版
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              <p className="mb-4">
                更強大的生成功能,帳號定位、選題、腳本一次到位
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>無限次數生成</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>更精準的個人化內容</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>批量生成選題庫</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="card-gradient border-white/20">
            <CardHeader>
              <User className="h-12 w-12 text-yellow-300 mb-4" />
              <CardTitle className="text-white text-2xl">
                IP 人設規劃
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/90">
              <p className="mb-4">
                AI 顧問幫你打造屬於你自己的 IP 人設,直接按表操課打造爆紅的矩陣號
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>完整 IP 人設分析</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>矩陣帳號策略規劃</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>長期內容日曆</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Video Section */}
        <Card className="card-gradient border-white/20 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              看看完整版能為你做什麼
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center">
              <p className="text-white/70">
                [宣傳影片位置 - 請替換為實際影片嵌入代碼]
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA & Form */}
        {!showForm && !formSubmitted && (
          <Card className="card-gradient border-white/20 mb-12">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                🎁 限時早鳥優惠
              </h2>
              <p className="text-xl text-white/90 mb-8">
                現在預約,享受首批用戶專屬優惠!
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-white/90 text-xl px-12 py-8 rounded-xl shadow-2xl hover:scale-105 transition-transform"
                onClick={() => setShowForm(true)}
              >
                <Sparkles className="mr-2 h-6 w-6" />
                立即預約購買完整版
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Preorder Form */}
        {showForm && !formSubmitted && (
          <Card className="card-gradient border-white/20 mb-12">
            <CardHeader>
              <CardTitle className="text-white text-2xl">完成資料立即啟用</CardTitle>
              <CardDescription className="text-white/80">
                填寫以下資訊,我們會盡快與您聯繫
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="例如: your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-white">
                    團隊規模 *
                  </Label>
                  <Select
                    value={formData.teamSize}
                    onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="請選擇團隊規模" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="個人">個人</SelectItem>
                      <SelectItem value="2-5人">2-5人</SelectItem>
                      <SelectItem value="6-10人">6-10人</SelectItem>
                      <SelectItem value="11-50人">11-50人</SelectItem>
                      <SelectItem value="50人以上">50人以上</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="useCase" className="text-white">
                    主要使用情境 *
                  </Label>
                  <Select
                    value={formData.useCase}
                    onValueChange={(value) => setFormData({ ...formData, useCase: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="請選擇使用情境" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="個人品牌經營">個人品牌經營</SelectItem>
                      <SelectItem value="企業行銷">企業行銷</SelectItem>
                      <SelectItem value="電商導購">電商導購</SelectItem>
                      <SelectItem value="知識分享">知識分享</SelectItem>
                      <SelectItem value="娛樂創作">娛樂創作</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo" className="text-white">
                    其他資訊 (選填)
                  </Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="有什麼想告訴我們的嗎?"
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-24"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                    onClick={() => setShowForm(false)}
                    disabled={submitMutation.isPending}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 bg-white text-blue-700 hover:bg-white/90"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        立即預約
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success Message with Social Links */}
        {formSubmitted && (
          <Card className="card-gradient border-white/20 mb-12">
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-20 w-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                🎉 預約成功!
              </h2>
              <p className="text-xl text-white/90 mb-8">
                感謝您的預約,我們會盡快與您聯繫!
              </p>
              
              {/* Social Links after form submission */}
              <div className="space-y-6 mt-8">
                <h3 className="text-2xl font-bold text-white">加入我們的社群,即時掌握最新消息</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <a
                    href="https://AIJobschool.short.gy/DjMNte"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all hover:scale-105"
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    <p className="text-white font-medium">LINE 官方帳號</p>
                  </a>
                  
                  <a
                    href="https://AIJobschool.short.gy/xBwV73"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all hover:scale-105"
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    <p className="text-white font-medium">LINE 社群</p>
                  </a>
                  
                  <a
                    href="https://AIJobschool.short.gy/MRCNvG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all hover:scale-105"
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <p className="text-white font-medium">官網</p>
                  </a>
                  
                  <a
                    href="https://AIJobschool.short.gy/kBmUAL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all hover:scale-105"
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <p className="text-white font-medium">YouTube</p>
                  </a>
                </div>
                <p className="text-white/70 text-sm mt-4">
                  加入 LINE 官方帳號,第一時間收到上線通知與專屬優惠!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Links (shown when form not submitted) */}
        {!formSubmitted && (
          <div className="text-center text-white space-y-6">
            <h3 className="text-2xl font-bold">追蹤我們的社群</h3>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <a
                href="https://AIJobschool.short.gy/DjMNte"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2 hover:scale-110 transform"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <span className="text-sm font-medium">LINE 官方</span>
              </a>
              
              <a
                href="https://AIJobschool.short.gy/MRCNvG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2 hover:scale-110 transform"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span className="text-sm font-medium">官網</span>
              </a>
              
              <a
                href="https://AIJobschool.short.gy/kBmUAL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors flex items-center gap-2 hover:scale-110 transform"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-sm font-medium">YouTube</span>
              </a>
            </div>
            <p className="text-white/70 text-sm">
              加入 LINE 官方帳號,第一時間收到上線通知與專屬優惠!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
