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
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-400',
    shadowColor: 'shadow-red-200'
  },
  toxicSoup: {
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-400',
    shadowColor: 'shadow-purple-200'
  },
  microStory: {
    bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-400',
    shadowColor: 'shadow-amber-200'
  },
  deepQuote: {
    bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-400',
    shadowColor: 'shadow-teal-200'
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

  // 根据类型调整卡片高度（微小说更长）
  const heightClass = type === 'microStory' 
    ? 'min-h-72 max-h-96 xl:min-h-[28rem] xl:max-h-[36rem]' 
    : 'h-56 xl:h-80';

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
      {/* 艺术像素风格卡片 - 只有文字 */}
      <div className={cn(
        'w-44 xl:w-72',
        heightClass,
        'pixel-border-thick border-[6px]',
        config.borderColor,
        config.bgColor,
        'rounded-2xl p-4 xl:p-8',
        'flex items-center justify-center',
        'shadow-[6px_6px_0px_0px] xl:shadow-[8px_8px_0px_0px]',
        config.shadowColor,
        'hover:shadow-[8px_8px_0px_0px] xl:hover:shadow-[10px_10px_0px_0px]',
        'transition-shadow',
        'overflow-hidden'
      )}>
        {/* 内容区域 - 可滚动 */}
        <div className="w-full h-full overflow-y-auto custom-scrollbar flex items-center justify-center">
          <p className={cn(
            'text-sm xl:text-lg leading-relaxed pixel-text break-words text-center',
            config.textColor,
            'font-bold'
          )}>
            {content || '生成中...'}
          </p>
        </div>
      </div>
    </div>
  );
}
