import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Copy, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Generate() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: "",
    targetAudience: "",
    goal: "",
    platform: "",
    style: "",
  });

  const generateMutation = trpc.content.generate.useMutation({
    onSuccess: () => {
      toast.success("生成成功!");
      setStep(3);
    },
    onError: (error: any) => {
      toast.error("生成失敗: " + error.message);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate(formData);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`已複製${label}到剪貼簿`);
  };

  const result = generateMutation.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-blue-700 hover:bg-blue-100 mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-8">
          {[
            { num: 1, label: "填寫需求" },
            { num: 2, label: "確認資訊" },
            { num: 3, label: "生成結果" },
          ].map(({ num, label }) => (
            <div key={num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= num
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {num}
                </div>
                <span className="mt-2 text-xs font-medium text-blue-700 whitespace-nowrap">
                  {label}
                </span>
              </div>
              {num < 3 && (
                <div
                  className={`w-16 h-1 mx-4 transition-all ${
                    step > num ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: 填寫資訊 */}
        {step === 1 && (
          <Card className="bg-white border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-700 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                告訴AI你的需求
              </CardTitle>
              <CardDescription className="text-blue-600">
                填寫以下資訊,讓 AI 為你量身打造短影音內容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-blue-700 font-medium">
                  你的主題或產品 *
                </Label>
                <Input
                  id="topic"
                  placeholder="例如:美白咀嚼錠、健身教學、美食分享..."
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-blue-700 font-medium">
                  目標受眾 *
                </Label>
                <Input
                  id="targetAudience"
                  placeholder="例如:25-35歲女性、健身新手、上班族..."
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                  className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700 font-medium">
                  影片目標 *
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "流量型", label: "流量型", desc: "吸粉/破圈" },
                    { value: "轉換型", label: "轉換型", desc: "帶貨/留資" },
                    { value: "教育型", label: "教育型", desc: "建立信任" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: option.value })}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        formData.goal === option.value
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs mt-1 opacity-75">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700 font-medium">
                  社群平台 *
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    "TikTok",
                    "Instagram Reels",
                    "小紅書",
                    "YouTube Shorts",
                    "Facebook Reels",
                  ].map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform })}
                      className={`p-3 rounded-lg border-2 text-center transition-all flex items-center justify-center text-sm leading-tight ${
                        formData.platform === platform
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style" className="text-blue-700 font-medium">
                  補充說明 (選填)
                </Label>
                <Textarea
                  id="style"
                  placeholder="例如:想要幽默風格、需要反差感、有 Before/After 素材..."
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 min-h-24"
                />
              </div>

              <Button
                size="lg"
                className="w-full bg-white text-blue-700 border-2 border-blue-600 hover:bg-blue-50"
                onClick={() => setStep(2)}
                disabled={!formData.topic || !formData.targetAudience || !formData.goal || !formData.platform}
              >
                下一步
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading Animation */}
        {generateMutation.isPending && (
          <Card className="bg-white border-blue-200 shadow-lg">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Animated AI Icon */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                    <Sparkles className="h-12 w-12 text-blue-600 animate-spin" style={{ animationDuration: '2s' }} />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                </div>
                
                {/* Loading Text */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-blue-700">
                    AI 正在為你生成內容...
                  </h3>
                  <p className="text-blue-600 animate-pulse">
                    分析你的需求並打造專屬腳本，請稍候
                  </p>
                </div>
                
                {/* Progress Dots */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full bg-blue-400"
                      style={{
                        animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: 確認並生成 */}
        {step === 2 && !generateMutation.isPending && (
          <Card className="bg-white border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-700">確認你的資訊</CardTitle>
              <CardDescription className="text-blue-600">
                確認無誤後,點擊生成按鈕
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 text-blue-700">
                <div>
                  <p className="text-gray-600 text-sm">主題或產品</p>
                  <p className="font-medium">{formData.topic}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">目標受眾</p>
                  <p className="font-medium">{formData.targetAudience}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">影片目標</p>
                  <p className="font-medium">{formData.goal}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">社群平台</p>
                  <p className="font-medium">{formData.platform}</p>
                </div>
                {formData.style && (
                  <div>
                    <p className="text-gray-600 text-sm">補充說明</p>
                    <p className="font-medium">{formData.style}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => setStep(1)}
                  disabled={generateMutation.isPending}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回修改
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI 生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      開始生成
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: 顯示結果 */}
        {step === 3 && result && (
          <div className="space-y-6">
            <Card className="bg-white border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-700 flex items-center justify-between">
                  <span>🎉 生成完成!</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setStep(1);
                      setFormData({ topic: "", targetAudience: "", goal: "", platform: "", style: "" });
                    }}
                  >
                    重新生成
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 帳號定位 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-blue-700 text-lg font-bold">📍 帳號定位</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-700 hover:bg-blue-50"
                      onClick={() => copyToClipboard(result.positioning, "帳號定位")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      複製
                    </Button>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-blue-700 whitespace-pre-wrap">
                    {result.positioning}
                  </div>
                </div>

                {/* 選題建議 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-blue-700 text-lg font-bold">💡 選題建議</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-700 hover:bg-blue-50"
                      onClick={() => copyToClipboard(result.topics, "選題建議")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      複製
                    </Button>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-blue-700 whitespace-pre-wrap">
                    {result.topics}
                  </div>
                </div>

                {/* 腳本範例 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-blue-700 text-lg font-bold">📝 腳本範例</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-700 hover:bg-blue-50"
                      onClick={() => copyToClipboard(result.script, "腳本範例")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      複製
                    </Button>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-blue-700 whitespace-pre-wrap">
                    {result.script}
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-blue-700 text-lg mb-4">
                    ✨ 想要更多功能?升級完整版解鎖 AI 對話顧問 + IP 人設規劃!
                  </p>
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-white/90"
                  onClick={() => setLocation("/premium")}
                >
                    <Sparkles className="mr-2 h-5 w-5" />
                    查看完整版
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        <p>Powered by AIJob學院</p>
      </footer>
    </div>
  );
}
