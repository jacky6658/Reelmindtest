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
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <section className="container min-h-screen flex flex-col items-center justify-center text-center text-white py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Typing Effect Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-2">
            {displayText}
            {!isTypingComplete && <span className="animate-pulse">|</span>}
          </h1>
          <h2 className="text-3xl md:text-5xl font-medium mb-6 text-white/90">
            你的AI短影音顧問
          </h2>

          {/* FOMO Content */}
          <div
            className={`space-y-4 transition-opacity duration-1000 ${
              isTypingComplete ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-xl md:text-2xl font-medium">
              一鍵生成 帳號定位 • 選題 • 腳本
            </p>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              🔥 別再浪費時間摸索了!讓 AI 顧問幫你打造爆款短影音內容
            </p>
            <p className="text-base md:text-lg text-white/80">
              ⚡ 已有 <span className="font-bold text-yellow-300">1000+</span> 創作者正在使用
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
              className="text-white/80 hover:text-white underline text-sm"
              onClick={() => setLocation("/premium")}
            >
              了解完整版功能 →
            </button>
          </div>

          {/* Feature Cards */}
          <div
            className={`grid md:grid-cols-3 gap-6 mt-16 transition-all duration-1000 delay-300 ${
              isTypingComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="card-gradient rounded-2xl p-6 text-left">
              <Target className="h-10 w-10 mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">精準定位</h3>
              <p className="text-white/80">
                AI 分析你的特質,打造專屬帳號定位,讓你在紅海中脫穎而出
              </p>
            </div>
            <div className="card-gradient rounded-2xl p-6 text-left">
              <Sparkles className="h-10 w-10 mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">爆款選題</h3>
              <p className="text-white/80">
                基於短影音知識庫,生成高流量選題,抓住用戶眼球
              </p>
            </div>
            <div className="card-gradient rounded-2xl p-6 text-left">
              <Zap className="h-10 w-10 mb-4 text-yellow-300" />
              <h3 className="text-xl font-bold mb-2">秒速腳本</h3>
              <p className="text-white/80">
                Hook → Value → CTA 完整結構,複製即用,省下 90% 創作時間
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
