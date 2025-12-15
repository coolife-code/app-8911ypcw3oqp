import { useEffect, useState } from 'react';

interface PixelCatProps {
  isShredding: boolean;
}

export default function PixelCat({ isShredding }: PixelCatProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isShredding) {
      setFrame(0);
      return;
    }

    // 碎纸时循环播放三帧动画
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(interval);
  }, [isShredding]);

  // 简单的像素猫表情
  const catFrames = [
    '🙈', // 捂眼
    '😏', // 偷笑
    '😵', // 晕倒
  ];

  return (
    <div className="fixed bottom-8 right-8 text-6xl transition-transform hover:scale-110">
      {isShredding ? (
        <div className="animate-bounce">
          {catFrames[frame]}
        </div>
      ) : (
        <div className="shake">
          😺
        </div>
      )}
    </div>
  );
}
