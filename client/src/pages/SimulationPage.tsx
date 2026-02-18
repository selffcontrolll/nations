import React, { useState, useEffect } from "react";
import { useSimulationState, useStartSimulation, useStopSimulation, useResetSimulation, useNextTurn } from "@/hooks/use-simulation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { TacticalMap } from "@/components/TacticalMap";
import { TerminalFeed } from "@/components/TerminalFeed";
import { ControlPanel } from "@/components/ControlPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { State } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SimulationPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredState, setHoveredState] = useState<State | null>(null);

  const [speed, setSpeed] = useState(2000);

  // Hook into data
  const { data, isLoading, error } = useSimulationState(isPlaying);
  
  // Mutations
  const startMutation = useStartSimulation();
  const stopMutation = useStopSimulation();
  const resetMutation = useResetSimulation();
  const nextMutation = useNextTurn();
  const speedMutation = useMutation({
    mutationFn: (interval: number) => apiRequest("POST", "/api/simulation/speed", { interval }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/simulation/state"] }),
  });

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    speedMutation.mutate(newSpeed);
  };

  // Sync local playing state with server state if available
  useEffect(() => {
    if (data) {
      setIsPlaying(data.isActive);
    }
  }, [data?.isActive]);

  const handlePlay = () => {
    setIsPlaying(true);
    startMutation.mutate();
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopMutation.mutate();
  };

  const handleReset = () => {
    setIsPlaying(false);
    resetMutation.mutate();
  };

  const handleNext = () => {
    nextMutation.mutate();
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center font-mono text-primary gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <div className="text-xl tracking-widest animate-pulse">INITIALIZING TACTICAL DATALINK...</div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center font-mono text-destructive gap-4">
        <div className="text-4xl font-bold">SYSTEM FAILURE</div>
        <p className="tracking-widest">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background relative">
      {/* Header */}
      <header className="h-14 border-b border-border bg-background/90 flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_var(--primary)]" />
          <h1 className="text-2xl font-display text-primary tracking-widest text-glow">
            STATE<span className="text-foreground">WARS</span>.EXE
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <span className="hidden md:inline">SYSTEM: ONLINE</span>
          <span className="hidden md:inline">LATENCY: 24ms</span>
          <span className="px-2 py-0.5 border border-primary/30 text-primary bg-primary/10 rounded text-[10px]">v1.0.4 BETA</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Area (Main) */}
        <main className="flex-1 relative flex flex-col p-4 md:p-6 overflow-hidden">
          <StatsPanel 
            hoveredState={hoveredState}
            totalStates={50} // Assuming standard US map
            aliveStates={data.states.filter(s => s.isAlive).length}
            currentRound={data.round}
            allStates={data.states}
          />
          
          <div className="flex-1 relative border border-border/50 rounded-lg overflow-hidden bg-black/40 shadow-inner">
            <TacticalMap 
              statesData={data.states} 
              onStateHover={setHoveredState} 
            />
            
            {/* Winner Overlay */}
            {data.winner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center backdrop-blur-sm"
              >
                <div className="text-center p-8 border-2 border-primary bg-background/90 shadow-[0_0_50px_var(--primary)] max-w-md mx-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                  <h2 className="text-4xl md:text-6xl font-display text-primary mb-2 text-glow">VICTORY</h2>
                  <div className="w-16 h-1 bg-primary mx-auto mb-6" />
                  <p className="text-lg font-mono text-foreground mb-2">UNITED STATES OF</p>
                  <p className="text-3xl font-bold text-white mb-8 uppercase tracking-widest">
                    {data.winner.displayName || data.winner.name}
                  </p>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-3 bg-primary text-primary-foreground font-bold hover:bg-white hover:text-black transition-colors font-mono tracking-widest"
                  >
                    START NEW SIMULATION
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        {/* Sidebar (Feed) - Hidden on very small screens, 80 w on med, 96 on lg */}
        <aside className="w-80 lg:w-96 hidden md:flex flex-col border-l border-border h-full relative z-10">
          <TerminalFeed events={data.events} />
        </aside>
      </div>

      {/* Mobile Feed Overlay (only visible on small screens) */}
      <div className="md:hidden h-48 border-t border-border bg-background">
        <TerminalFeed events={data.events} />
      </div>

      {/* Floating Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 bg-background/90 border border-primary/20 p-1 rounded-full backdrop-blur-sm">
          <button 
            onClick={() => handleSpeedChange(2000)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono transition-colors ${speed === 2000 ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
          >
            1X
          </button>
          <button 
            onClick={() => handleSpeedChange(500)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono transition-colors ${speed === 500 ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
          >
            2X
          </button>
          <button 
            onClick={() => handleSpeedChange(100)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono transition-colors ${speed === 100 ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
          >
            ULTRA
          </button>
        </div>
        <ControlPanel 
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onNext={handleNext}
          isPending={startMutation.isPending || stopMutation.isPending || resetMutation.isPending || nextMutation.isPending}
        />
      </div>
    </div>
  );
}
