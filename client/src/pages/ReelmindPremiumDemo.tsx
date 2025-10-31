import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Zap, 
  Target, 
  MessageSquare, 
  Database,
  User,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";

export default function ReelmindPremiumDemo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ReelMind
              </h1>
              <div className="hidden md:flex gap-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                  功能
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                  方案
                </a>
                <a href="#guide" className="text-gray-600 hover:text-blue-600 transition-colors">
                  指南
                </a>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              🔐 登入
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-block mb-6 px-4 py-2 bg-blue-100 rounded-full">
            <span className="text-blue-700 font-medium text-sm">
              ✨ 四項核心功能,一站式短影音創作
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            讓 AI 幫你打造
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              下一支爆款短影音
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI 生成腳本、AI 帳號定位,一次完成。
            <br />
            專為台灣創作者打造的短影音智能體。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              立即啟用 AI 智能體
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all"
            >
              了解使用方式
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>產出時間減少 70%</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>上片頻率提升 200%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ReelMind 能為你做什麼?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            以 AI 顧問對話、一鍵生成與 IP 人設規劃,協助台灣創作者建立高效率的短影音內容系統
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AI 顧問 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-200">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI 顧問</h3>
              <p className="text-gray-600 mb-4">
                與 AI 顧問深度對話,釐清你的目標、受眾、內容方向與變現策略
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>診斷痛點與目標對齊</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>拆解內容支柱與流量節奏</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>產出具體行動清單</span>
                </li>
              </ul>
              <Button
                variant="ghost"
                className="mt-6 text-blue-600 hover:text-blue-700 p-0"
              >
                了解更多 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* 一鍵生成 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-green-200">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">一鍵生成</h3>
              <p className="text-gray-600 mb-4">
                輸入平台與主題,立即產出 Hook 開場、口播文字、鏡頭指示
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>60 秒內完成短影音腳本</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>自動附 CTA 與情緒節奏</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>支援 IG / TikTok / Shorts</span>
                </li>
              </ul>
              <Button
                variant="ghost"
                className="mt-6 text-green-600 hover:text-green-700 p-0"
              >
                了解更多 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* IP 人設 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">IP 人設</h3>
              <p className="text-gray-600 mb-4">
                透過訪談題建立 IP Profile,並附 14 天內容規劃
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>IP Profile + 14 天規劃</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>品牌語氣與說話風格生成</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>可持續優化與迭代</span>
                </li>
              </ul>
              <Button
                variant="ghost"
                className="mt-6 text-purple-600 hover:text-purple-700 p-0"
              >
                了解更多 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* 創作者資料庫 */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-orange-200">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">創作者資料庫</h3>
              <p className="text-gray-600 mb-4">
                你的每一次生成都會自動歸檔,支援 PDF / CSV 下載
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>我的腳本:分鏡、口播、CTA</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>一鍵下載與重生</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>可視化清單,方便整理</span>
                </li>
              </ul>
              <Button
                variant="ghost"
                className="mt-6 text-orange-600 hover:text-orange-700 p-0"
              >
                了解更多 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Usage Flow */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold">建議使用順序</h3>
          </div>
          <p className="text-gray-700">
            先做 <span className="font-semibold text-purple-600">IP 人設</span> → 取得 14 天規劃 → 每日使用
            <span className="font-semibold text-green-600">一鍵生成</span>。
            AI 會記住你之前的內容並持續優化。
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 bg-gradient-to-br from-gray-50 to-blue-50 -mx-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            開始你的 AI 創作之旅
          </h2>
          <p className="text-xl text-gray-600">
            💎 單一訂閱,功能完整,不分等級
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">月費方案</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">NT$3,980</span>
                <span className="text-gray-500">/月</span>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                立即訂閱
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-xl transition-all relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              省 NT$7,960
            </div>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-2">年費方案</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">NT$39,800</span>
                <span className="text-gray-500">/年</span>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                立即訂閱
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center mt-8 text-gray-600">
          💡 若你已有序號,請前往「兌換序號」開通一年使用權
        </p>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p className="mb-2">AI 短影音｜AI 生成腳本｜AI 帳號定位</p>
          <p className="text-sm">服務地區:台北｜台中｜高雄｜香港｜新加坡</p>
          <p className="mt-4 text-sm">
            ReelMind — 為亞洲創作者打造的 AI 短影音智能體
          </p>
        </div>
      </footer>
    </div>
  );
}
