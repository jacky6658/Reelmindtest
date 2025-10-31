import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [displayText, setDisplayText] = useState("");
  const fullText = "Reelmind";
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container min-h-screen flex flex-col items-center justify-center text-center py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Typing Effect Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-2 text-blue-700">
            {displayText}
            {!isTypingComplete && <span className="animate-pulse">|</span>}
          </h1>
          <h2 className="text-3xl md:text-5xl font-medium mb-6 text-blue-700">
            你的AI短影音顧問
          </h2>

          {/* FOMO Content */}
          <div
            className={`space-y-4 transition-opacity duration-1000 ${
              isTypingComplete ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-xl md:text-2xl font-medium text-blue-700">
              一鍵生成 帳號定位 • 選題 • 腳本
            </p>
            <p className="text-lg md:text-xl text-blue-600 max-w-2xl mx-auto">
              🔥 別再浪費時間摸索了!讓 AI 顧問幫你打造爆款短影音內容
            </p>
            <p className="text-base md:text-lg text-blue-600">
              ⚡ 已有 <span className="font-bold text-blue-700">1000+</span> 創作者正在使用
            </p>
          </div>

          {/* CTA Button */}
          <div
            className={`flex flex-col gap-4 justify-center items-center mt-12 transition-all duration-1000 ${
              isTypingComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-2xl hover:scale-105 transition-transform"
              onClick={() => setLocation("/generate")}
            >
              <Zap className="mr-2 h-5 w-5" />
              立即免費體驗一鍵生成
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <button
              className="text-blue-600 hover:text-blue-800 underline text-sm"
              onClick={() => setLocation("/premium")}
            >
              了解完整版功能 →
            </button>
            
            {/* Social Links */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <a
                href="https://AIJobschool.short.gy/DjMNte"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 hover:scale-110 transform"
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
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 hover:scale-110 transform"
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
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 hover:scale-110 transform"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span className="text-sm font-medium">YouTube</span>
              </a>
            </div>
          </div>

          {/* Feature Cards */}
          <div
            className={`grid md:grid-cols-3 gap-6 mt-16 transition-all duration-1000 delay-300 ${
              isTypingComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-shadow">
              <Target className="h-10 w-10 mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-2 text-blue-700">精準定位</h3>
              <p className="text-blue-600">
                AI 分析你的特質,打造專屬帳號定位,讓你在紅海中脫穎而出
              </p>
            </div>
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles className="h-10 w-10 mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-2 text-blue-700">爆款選題</h3>
              <p className="text-blue-600">
                基於短影音知識庫,生成高流量選題,抓住用戶眼球
              </p>
            </div>
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-shadow">
              <Zap className="h-10 w-10 mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-2 text-blue-700">秒速腳本</h3>
              <p className="text-blue-600">
                Hook → Value → CTA 完整結構,複製即用,省下 90% 創作時間
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-white/60 text-sm">
        <p>Powered by AIJob學院</p>
      </footer>
    </div>
  );
}
