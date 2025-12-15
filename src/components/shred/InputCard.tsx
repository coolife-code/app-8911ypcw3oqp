import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface InputCardProps {
  onShred: (text: string) => void;
  isShredding: boolean;
}

export default function InputCard({ onShred, isShredding }: InputCardProps) {
  const [text, setText] = useState('');

  const handleShred = () => {
    if (text.trim()) {
      onShred(text);
      setText('');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="pixel-border border-primary bg-card rounded-lg p-6 shadow-lg">
        <h2 className="text-sm font-bold text-center mb-4 pixel-text">
          今天想说点什么？
        </h2>
        
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="记录心情、吐槽、碎碎念..."
          className="min-h-[120px] pixel-border text-sm resize-none"
          disabled={isShredding}
          maxLength={200}
        />
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-muted-foreground">
            {text.length}/200
          </span>
          
          <Button
            onClick={handleShred}
            disabled={!text.trim() || isShredding}
            className="pixel-border bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs"
          >
            {isShredding ? '碎纸中...' : '碎一下 ⚡'}
          </Button>
        </div>
      </div>
    </div>
  );
}
