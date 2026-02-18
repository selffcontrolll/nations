import React from "react";
import { Play, Pause, Square, RefreshCw, FastForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onNext: () => void;
  isPending: boolean;
}

export function ControlPanel({ isPlaying, onPlay, onPause, onReset, onNext, isPending }: ControlPanelProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/90 border border-border backdrop-blur-md rounded-lg shadow-2xl z-50">
      <ControlButton
        onClick={isPlaying ? onPause : onPlay}
        disabled={isPending}
        active={isPlaying}
        icon={isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        label={isPlaying ? "PAUSE" : "START"}
        variant="primary"
      />

      <div className="w-px h-8 bg-border mx-1" />

      <ControlButton
        onClick={onNext}
        disabled={isPending || isPlaying}
        icon={<FastForward className="w-5 h-5" />}
        label="STEP"
        variant="secondary"
      />

      <div className="w-px h-8 bg-border mx-1" />

      <ControlButton
        onClick={onReset}
        disabled={isPending}
        icon={<RefreshCw className="w-4 h-4" />}
        label="RESET"
        variant="destructive"
      />
    </div>
  );
}

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  variant: "primary" | "secondary" | "destructive";
}

function ControlButton({ active, icon, label, variant, className, ...props }: ControlButtonProps) {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center w-16 h-14 rounded transition-all duration-200 group relative overflow-hidden",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:bg-white/5 active:scale-95",
        variant === "primary" && "text-primary hover:text-primary-foreground hover:bg-primary",
        variant === "secondary" && "text-accent hover:text-accent-foreground hover:bg-accent",
        variant === "destructive" && "text-destructive hover:text-destructive-foreground hover:bg-destructive",
        active && variant === "primary" && "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,255,0,0.4)]",
        className
      )}
      {...props}
    >
      {/* Scanline effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500" />
      
      <div className="mb-1">{icon}</div>
      <span className="text-[9px] font-bold tracking-wider">{label}</span>
    </button>
  );
}
