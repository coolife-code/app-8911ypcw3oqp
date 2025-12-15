import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PaperStripProps {
  type: 'darkCheer' | 'toxicSoup' | 'microStory' | 'deepQuote';
  content: string;
  index: number;
}

const typeConfig = {
  darkCheer: {
    title: '黑暗激励',
    emoji: '🔥',
    bgColor: 'bg-chart-1',
    textColor: 'text-chart-1'
  },
  toxicSoup: {
    title: '毒鸡汤',
    emoji: '💀',
    bgColor: 'bg-chart-2',
    textColor: 'text-chart-2'
  },
  microStory: {
    title: '微小说',
    emoji: '📖',
    bgColor: 'bg-chart-3',
    textColor: 'text-chart-3'
  },
  deepQuote: {
    title: '哲理名言',
    emoji: '💎',
    bgColor: 'bg-chart-4',
    textColor: 'text-chart-4'
  }
};

export default function PaperStrip({ type, content, index }: PaperStripProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const config = typeConfig[type];

  // 计算卡片位置和旋转角度
  const rotation = (index - 1.5) * 3; // -4.5, -1.5, 1.5, 4.5度
  const zIndex = 10 + index;

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flip-card cursor-pointer"
      style={{
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={cn('flip-card-inner w-64 h-96', isFlipped && 'flipped')}>
        {/* 正面 - 标题 */}
        <div className="flip-card-front absolute w-full h-full">
          <div className={cn(
            'w-full h-full pixel-border border-foreground rounded-lg p-6',
            'flex flex-col items-center justify-center gap-4',
            'bg-card shadow-xl'
          )}>
            <div className="text-6xl">{config.emoji}</div>
            <h3 className="text-sm font-bold pixel-text text-center">
              {config.title}
            </h3>
            <p className="text-xs text-muted-foreground text-center">
              点击翻面查看
            </p>
          </div>
        </div>

        {/* 背面 - 内容 */}
        <div className="flip-card-back absolute w-full h-full">
          <div className={cn(
            'w-full h-full pixel-border border-foreground rounded-lg p-6',
            'flex flex-col items-center justify-center',
            config.bgColor,
            'shadow-xl'
          )}>
            <p className="text-xs leading-relaxed text-center text-background font-bold break-words px-2">
              {content || '生成中...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
