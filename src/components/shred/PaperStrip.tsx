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
    bgColor: 'bg-chart-1/20',
    borderColor: 'border-chart-1',
    textColor: 'text-chart-1'
  },
  toxicSoup: {
    title: '毒鸡汤',
    emoji: '💀',
    bgColor: 'bg-chart-2/20',
    borderColor: 'border-chart-2',
    textColor: 'text-chart-2'
  },
  microStory: {
    title: '微小说',
    emoji: '📖',
    bgColor: 'bg-chart-3/20',
    borderColor: 'border-chart-3',
    textColor: 'text-chart-3'
  },
  deepQuote: {
    title: '哲理名言',
    emoji: '💎',
    bgColor: 'bg-chart-4/20',
    borderColor: 'border-chart-4',
    textColor: 'text-chart-4'
  }
};

export default function PaperStrip({ type, content, index, position, onDragStart }: PaperStripProps) {
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

  // 根据类型调整卡片高度（微小说可能更长）
  const heightClass = type === 'microStory' 
    ? 'min-h-56 max-h-80 xl:min-h-96 xl:max-h-[32rem]' 
    : 'h-56 xl:h-96';

  return (
    <div
      className={cn(
        'absolute cursor-grab active:cursor-grabbing transition-opacity',
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
    >
      {/* 像素风格卡片 - 直接显示内容 */}
      <div className={cn(
        'w-40 xl:w-64',
        heightClass,
        'pixel-border-thick border-4',
        config.borderColor,
        config.bgColor,
        'rounded-lg p-3 xl:p-6',
        'flex flex-col gap-2 xl:gap-3',
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]',
        'hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]',
        'transition-shadow'
      )}>
        {/* 标题栏 */}
        <div className={cn(
          'flex items-center gap-2 pb-2 border-b-2',
          config.borderColor
        )}>
          <span className="text-2xl xl:text-4xl">{config.emoji}</span>
          <h3 className={cn(
            'text-[10px] xl:text-sm font-bold pixel-text',
            config.textColor
          )}>
            {config.title}
          </h3>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <p className={cn(
            'text-[9px] xl:text-xs leading-relaxed pixel-text break-words',
            'text-foreground'
          )}>
            {content || '生成中...'}
          </p>
        </div>

        {/* 底部提示 */}
        <div className="pt-2 border-t border-border">
          <p className="text-[7px] xl:text-[9px] text-muted-foreground text-center pixel-text">
            拖到垃圾桶重新碎纸
          </p>
        </div>
      </div>
    </div>
  );
}
