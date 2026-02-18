import React from "react";
import { State } from "@shared/schema";
import { Activity, Users, Map as MapIcon, Globe } from "lucide-react";

interface StatsPanelProps {
  hoveredState: State | null;
  totalStates: number;
  aliveStates: number;
  currentRound: number;
  allStates: State[];
}

export function StatsPanel({ hoveredState, totalStates, aliveStates, currentRound, allStates }: StatsPanelProps) {
  const territoryCount = hoveredState 
    ? allStates.filter(s => s.ownerId === hoveredState.id).length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      {/* Global Stats */}
      <div className="bg-muted/20 border border-border p-3 rounded flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded border border-primary/20">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Active Nations</p>
          <p className="text-xl font-display text-primary">{aliveStates} <span className="text-muted-foreground text-sm">/ {totalStates}</span></p>
        </div>
      </div>

      <div className="bg-muted/20 border border-border p-3 rounded flex items-center gap-3">
        <div className="p-2 bg-secondary/10 rounded border border-secondary/20">
          <Activity className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Current Round</p>
          <p className="text-xl font-display text-secondary">{currentRound}</p>
        </div>
      </div>

      {/* Selected State Stats - Dynamic */}
      <div className="md:col-span-2 bg-muted/20 border border-border p-3 rounded flex items-center justify-between min-h-[72px]">
        {hoveredState ? (
          <>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded border-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: hoveredState.color, borderColor: 'white' }}
              >
                {hoveredState.code}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Controlling Power</p>
                <h3 className="text-lg font-display text-foreground tracking-wide">{hoveredState.displayName || hoveredState.name}</h3>
              </div>
            </div>
            
            <div className="flex gap-6 pr-4">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <MapIcon className="w-3 h-3" /> Territories
                </div>
                <p className="font-mono text-foreground">{territoryCount}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <Users className="w-3 h-3" /> Population
                </div>
                <p className="font-mono text-foreground">
                  {hoveredState.population >= 1000000 
                    ? `${(hoveredState.population / 1000000).toFixed(1)}M` 
                    : `${(hoveredState.population / 1000).toFixed(0)}K`}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <MapIcon className="w-3 h-3" /> Status
                </div>
                <p className={`font-mono ${hoveredState.isAlive ? 'text-primary' : 'text-destructive'}`}>
                  {hoveredState.isAlive ? 'ACTIVE' : 'ELIMINATED'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center text-muted-foreground/50 text-sm font-mono animate-pulse">
            &lt; HOVER OVER MAP FOR INTELLIGENCE &gt;
          </div>
        )}
      </div>
    </div>
  );
}
