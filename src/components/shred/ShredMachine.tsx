interface ShredMachineProps {
  isActive: boolean;
}

export default function ShredMachine({ isActive }: ShredMachineProps) {
  return (
    <div className="relative w-full max-w-md mx-auto mt-8">
      <div className={`
        pixel-border border-secondary bg-secondary/20 rounded-lg p-4
        ${isActive ? 'animate-pulse' : ''}
      `}>
        <div className="flex items-center justify-center gap-4">
          <div className="text-4xl">🗑️</div>
          <div className="flex-1">
            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
              {isActive && (
                <div className="h-full bg-secondary animate-pulse" style={{ width: '100%' }} />
              )}
            </div>
          </div>
          <div className="text-4xl">✂️</div>
        </div>
        
        {isActive && (
          <p className="text-center text-sm mt-2 pixel-text text-secondary">
            碎纸中...
          </p>
        )}
      </div>
    </div>
  );
}
