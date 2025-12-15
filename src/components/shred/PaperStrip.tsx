import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PaperStripProps {
  type: 'darkCheer' | 'toxicSoup' | 'joke' | 'deepQuote';
  content: string;
  index: number;
  position?: { x: number; y: number; rotation: number }; // 散乱位置
  onDragStart?: (content: string, index: number) => void; // 拖拽开始回调
  onDragEnd?: (index: number, clientX: number, clientY: number, droppedOnTrash: boolean) => void; // 拖拽结束回调
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
  joke: {
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

export default function PaperStrip({ type, content, index, position, onDragStart, onDragEnd }: PaperStripProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
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
    setDragStartPos({ x: e.clientX, y: e.clientY });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', content);
    
    if (onDragStart) {
      onDragStart(content, index);
    }
  };

  // 处理拖拽结束
  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    
    if (onDragEnd) {
      // 检测是否拖到垃圾桶区域（右下角）
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const trashZoneSize = viewportWidth < 1280 ? 80 : 160; // 移动端80px，桌面端160px
      const trashZoneMargin = viewportWidth < 1280 ? 16 : 32; // 移动端16px，桌面端32px
      
      const isInTrashZone = 
        e.clientX > viewportWidth - trashZoneSize - trashZoneMargin &&
        e.clientY > viewportHeight - trashZoneSize - trashZoneMargin;
      
      onDragEnd(index, e.clientX, e.clientY, isInTrashZone);
    }
  };

  // 所有卡片统一大小
  const heightClass = 'h-64 xl:h-96';

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
        {/* 内容区域 - 不显示滚动条 */}
        <div className="w-full h-full overflow-y-auto scrollbar-hide flex items-center justify-center p-2">
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
