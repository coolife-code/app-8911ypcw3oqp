import { useState, useEffect } from 'react';
import InputCard from '@/components/shred/InputCard';
import ShredMachine from '@/components/shred/ShredMachine';
import CardStack from '@/components/shred/CardStack';
import PixelCat from '@/components/shred/PixelCat';
import { generateShredResponses, ShredResponse } from '@/services/ai';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
  const [isShredding, setIsShredding] = useState(false);
  const [responses, setResponses] = useState<ShredResponse[]>([]);
  const [showStack, setShowStack] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  // 午夜模式自动切换
  useEffect(() => {
    const checkMidnight = () => {
      const hour = new Date().getHours();
      const shouldBeDark = hour >= 0 && hour < 6;
      
      setIsDarkMode(shouldBeDark);
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    checkMidnight();
    const interval = setInterval(checkMidnight, 60000); // 每分钟检查一次

    return () => clearInterval(interval);
  }, []);

  const handleShred = async (text: string) => {
    setIsShredding(true);

    try {
      const response = await generateShredResponses(text);
      
      // 添加到响应列表
      setResponses(prev => [...prev, response]);
      setShowStack(true);
      
      // 播放音效（如果有）
      // playShredSound();
      
    } catch (error) {
      console.error('碎纸失败:', error);
      
      // 根据错误类型提供不同的提示
      let errorMessage = '请稍后重试';
      if (error instanceof Error) {
        if (error.message.includes('格式错误')) {
          errorMessage = 'AI小精灵打瞌睡了，请再试一次 😴';
        } else if (error.message.includes('不完整')) {
          errorMessage = 'AI小精灵偷懒了，请再试一次 😅';
        } else if (error.message.includes('网络')) {
          errorMessage = '网络连接不稳定，请检查网络后重试 📡';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: '碎纸失败 💔',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsShredding(false);
    }
  };

  const handleClearStack = () => {
    setShowStack(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl">📝</div>
        <div className="absolute top-20 right-20 text-6xl">✂️</div>
        <div className="absolute bottom-20 left-20 text-6xl">🗑️</div>
        <div className="absolute bottom-10 right-10 text-6xl">💭</div>
      </div>

      {/* 标题 */}
      <div className="text-center mb-8 z-10">
        <h1 className={`
          text-2xl xl:text-3xl font-bold mb-4 pixel-text
          ${isDarkMode ? 'sparkle-text' : ''}
        `}>
          碎念小栈
        </h1>
        <p className="text-xs xl:text-sm text-muted-foreground">
          把烦恼丢进碎纸机，收获四倍快乐 ✨
        </p>
      </div>

      {/* 输入卡片 */}
      {!showStack && (
        <div className="w-full max-w-2xl z-10">
          <InputCard onShred={handleShred} isShredding={isShredding} />
          
          {/* 碎纸机动画 */}
          {isShredding && (
            <ShredMachine isActive={isShredding} />
          )}
        </div>
      )}

      {/* 卡片堆叠展示 */}
      {showStack && (
        <CardStack 
          responses={responses} 
          onClear={handleClearStack}
        />
      )}

      {/* 像素猫 */}
      <PixelCat isShredding={isShredding} />

      {/* 页脚 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center">
        <p>© 2025 碎念小栈 | AI驱动的情绪碎纸机</p>
      </div>
    </div>
  );
}
