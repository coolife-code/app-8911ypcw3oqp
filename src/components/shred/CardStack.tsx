import { useEffect, useState } from 'react';
import PaperStrip from './PaperStrip';
import { ShredResponse } from '@/services/ai';
import { cn } from '@/lib/utils';

interface CardStackProps {
  responses: ShredResponse[];
  onClear?: () => void;
}

export default function CardStack({ responses, onClear }: CardStackProps) {
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
  const strips: Array<{ type: keyof ShredResponse; content: string }> = [
    { type: 'darkCheer', content: currentResponse.darkCheer },
    { type: 'toxicSoup', content: currentResponse.toxicSoup },
    { type: 'microStory', content: currentResponse.microStory },
    { type: 'deepQuote', content: currentResponse.deepQuote },
  ];

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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          <button
            onClick={onClear}
            className="pixel-border border-foreground bg-card px-6 py-3 rounded-lg font-bold hover:bg-accent transition-colors text-xs"
          >
            再碎一张 ✨
          </button>
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
