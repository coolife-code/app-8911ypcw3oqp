import { useEffect, useState, useMemo } from 'react';
import PaperStrip from './PaperStrip';
import { ShredResponse } from '@/services/ai';
import { cn } from '@/lib/utils';

interface CardStackProps {
  responses: ShredResponse[];
  onClear?: () => void;
  onReshred?: (text: string) => void; // 拖入垃圾桶后重新碎纸
}

// 生成随机散乱位置
const generateRandomPosition = (index: number) => {
  // 四个象限的中心点
  const quadrants = [
    { x: 30, y: 30 }, // 左上
    { x: 70, y: 30 }, // 右上
    { x: 30, y: 70 }, // 左下
    { x: 70, y: 70 }, // 右下
  ];
  
  const quadrant = quadrants[index % 4];
  
  return {
    x: quadrant.x + (Math.random() - 0.5) * 20, // ±10% 随机偏移
    y: quadrant.y + (Math.random() - 0.5) * 20,
    rotation: (Math.random() - 0.5) * 30 // ±15度随机旋转
  };
};

export default function CardStack({ responses, onClear, onReshred }: CardStackProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedContent, setDraggedContent] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number>(-1);

  if (responses.length === 0) {
    return null;
  }

  const currentResponse = responses[responses.length - 1];
  
  // 为每张纸条生成固定的随机位置（使用useMemo避免重新渲染时位置变化）
  const [stripPositions, setStripPositions] = useState(() => 
    [0, 1, 2, 3].map(i => generateRandomPosition(i))
  );

  // 当responses变化时重新生成位置
  useEffect(() => {
    setStripPositions([0, 1, 2, 3].map(i => generateRandomPosition(i)));
  }, [responses.length]);

  const strips: Array<{ 
    type: keyof Omit<ShredResponse, 'originalText'>; 
    content: string;
    position: { x: number; y: number; rotation: number };
  }> = [
    { type: 'darkCheer', content: currentResponse.darkCheer, position: stripPositions[0] },
    { type: 'toxicSoup', content: currentResponse.toxicSoup, position: stripPositions[1] },
    { type: 'joke', content: currentResponse.joke, position: stripPositions[2] },
    { type: 'deepQuote', content: currentResponse.deepQuote, position: stripPositions[3] },
  ];

  // 处理拖拽进入垃圾桶区域
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  // 处理拖拽离开垃圾桶区域
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // 处理放下纸条到垃圾桶
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const content = e.dataTransfer.getData('text/plain');
    if (content && onReshred) {
      onReshred(content);
    }
  };

  // 处理纸条开始拖拽
  const handleStripDragStart = (content: string, index: number) => {
    setDraggedContent(content);
    setDraggedIndex(index);
  };

  // 处理纸条拖拽结束，更新位置
  const handleStripDragEnd = (index: number, clientX: number, clientY: number, droppedOnTrash: boolean) => {
    setDraggedIndex(-1);
    
    // 如果拖到垃圾桶，不更新位置
    if (droppedOnTrash) {
      return;
    }

    // 计算新位置（相对于视口的百分比）
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const newX = (clientX / viewportWidth) * 100;
    const newY = (clientY / viewportHeight) * 100;

    // 更新卡片位置
    setStripPositions(prev => {
      const newPositions = [...prev];
      newPositions[index] = {
        x: Math.max(10, Math.min(90, newX)), // 限制在10%-90%范围内
        y: Math.max(10, Math.min(90, newY)),
        rotation: prev[index].rotation // 保持原有旋转角度
      };
      return newPositions;
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      {/* 散乱的纸条 */}
      <div className="relative w-full h-full">
        {strips.map((strip, index) => (
          <PaperStrip
            key={`${responses.length}-${strip.type}`}
            type={strip.type}
            content={strip.content}
            index={index}
            position={strip.position}
            onDragStart={handleStripDragStart}
            onDragEnd={handleStripDragEnd}
          />
        ))}
      </div>

      {/* 垃圾桶 Drop Zone - 右下角 */}
      <div
        className={cn(
          'fixed bottom-4 right-4 w-20 h-20 xl:bottom-8 xl:right-8 xl:w-40 xl:h-40',
          'pixel-border border-foreground rounded-lg',
          'flex flex-col items-center justify-center gap-1 xl:gap-2',
          'transition-all duration-300',
          isDragOver 
            ? 'bg-primary/30 border-primary scale-110 shadow-2xl' 
            : 'bg-card/50 hover:bg-card/80'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={cn(
          'text-3xl xl:text-6xl transition-transform',
          isDragOver && 'animate-bounce'
        )}>
          🗑️
        </div>
        <p className="text-[8px] xl:text-xs pixel-text text-center px-1 xl:px-2">
          {isDragOver ? '松手碎纸！' : '拖到这里'}
        </p>
      </div>

      {/* 返回按钮 - 左下角 */}
      <div className="fixed bottom-4 left-4 xl:bottom-8 xl:left-8">
        <button
          onClick={onClear}
          className="pixel-border border-foreground bg-card px-3 py-2 xl:px-6 xl:py-3 rounded-lg font-bold hover:bg-accent transition-colors text-[10px] xl:text-xs"
        >
          输入新内容 ✨
        </button>
      </div>

      {/* 提示信息 - 顶部 */}
      <div className="fixed top-4 xl:top-8 left-1/2 -translate-x-1/2 text-center px-4">
        <p className="text-[10px] xl:text-xs pixel-text mb-1 xl:mb-2">
          已生成 {responses.length} 次
        </p>
        <p className="text-[8px] xl:text-[10px] text-muted-foreground">
          拖动卡片到垃圾桶重新碎纸
        </p>
      </div>
    </div>
  );
}
