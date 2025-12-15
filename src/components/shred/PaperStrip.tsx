import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PaperStripProps {
  type: 'darkCheer' | 'toxicSoup' | 'microStory' | 'deepQuote';
  content: string;
  index: number;
  position?: { x: number; y: number; rotation: number }; // 散乱位置
  onDragStart?: (content: string) => void; // 拖拽开始回调
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

export default function PaperStrip({ type, content, index, position, onDragStart }: PaperStripProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const config = typeConfig[type];

  // 使用传入的位置或默认堆叠位置
  const defaultRotation = (index - 1.5) * 3;
  const rotation = position?.rotation ?? defaultRotation;
  const left = position?.x ?? 50;
  const top = position?.y ?? 50;
  const zIndex = 10 + index;

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', content);
    
    if (onDragStart) {
      onDragStart(content);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        'absolute flip-card cursor-grab active:cursor-grabbing transition-opacity',
        isDragging && 'opacity-50'
      )}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => !isDragging && setIsFlipped(!isFlipped)}
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
              点击翻面 / 拖到垃圾桶
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
