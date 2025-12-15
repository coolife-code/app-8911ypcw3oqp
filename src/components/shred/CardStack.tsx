import { useEffect, useState } from 'react';
import PaperStrip from './PaperStrip';
import { ShredResponse } from '@/services/ai';
import { cn } from '@/lib/utils';

interface CardStackProps {
  responses: ShredResponse[];
  onClear?: () => void;
  onReshred?: (text: string) => void; // 新增：重新碎纸回调
}

export default function CardStack({ responses, onClear, onReshred }: CardStackProps) {
  const [shouldWobble, setShouldWobble] = useState(false);

  useEffect(() => {
    // 当堆叠到第7张时触发晃动
    if (responses.length === 7) {
      setShouldWobble(true);
      setTimeout(() => setShouldWobble(false), 1000);
    }
  }, [responses.length]);

  if (responses.length === 0) {
    return null;
  }

  const currentResponse = responses[responses.length - 1];
  const strips: Array<{ type: keyof Omit<ShredResponse, 'originalText'>; content: string }> = [
    { type: 'darkCheer', content: currentResponse.darkCheer },
    { type: 'toxicSoup', content: currentResponse.toxicSoup },
    { type: 'microStory', content: currentResponse.microStory },
    { type: 'deepQuote', content: currentResponse.deepQuote },
  ];

  // 处理重新碎纸
  const handleReshred = () => {
    if (onReshred && currentResponse.originalText) {
      onReshred(currentResponse.originalText);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={cn(
        'relative w-full h-full flex items-center justify-center',
        shouldWobble && 'tower-wobble'
      )}>
        {/* 卡片堆叠显示 */}
        {strips.map((strip, index) => (
          <PaperStrip
            key={`${responses.length}-${strip.type}`}
            type={strip.type}
            content={strip.content}
            index={index}
          />
        ))}

        {/* 控制按钮 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col xl:flex-row gap-3 items-center">
          <button
            onClick={handleReshred}
            className="pixel-border border-primary bg-primary/10 px-6 py-3 rounded-lg font-bold hover:bg-primary/20 transition-colors text-xs text-primary"
          >
            用这张再碎 🔄
          </button>
          <button
            onClick={onClear}
            className="pixel-border border-foreground bg-card px-6 py-3 rounded-lg font-bold hover:bg-accent transition-colors text-xs"
          >
            输入新内容 ✨
          </button>
        </div>

        {/* 原始文本显示 */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 max-w-md text-center px-4">
          <p className="text-[10px] text-muted-foreground mb-1">原始碎念</p>
          <p className="text-xs pixel-text text-foreground/80 line-clamp-2">
            {currentResponse.originalText}
          </p>
        </div>

        {/* 堆叠计数和警告 */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs pixel-text">
            已碎 {responses.length} 张
          </p>
          {responses.length >= 7 && (
            <p className="text-xs text-destructive mt-2 animate-bounce">
              ⚠️ 再高就倒了哦！
            </p>
          )}
        </div>

        {/* 左右滑动提示 */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
          点击卡片翻面查看内容
        </div>
      </div>
    </div>
  );
}
