import React, { useEffect, useRef } from "react";
import { GameEvent } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Skull, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalFeedProps {
  events: GameEvent[];
}

export function TerminalFeed({ events }: TerminalFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex flex-col h-full bg-black/80 border-l border-border backdrop-blur-sm overflow-hidden font-mono">
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20">
        <Terminal className="w-4 h-4 text-primary animate-pulse" />
        <h3 className="text-sm font-bold text-primary tracking-widest uppercase">
          Battle Logs
        </h3>
        <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-ping" />
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {events.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground text-xs italic text-center mt-10"
            >
              &gt; WAITING FOR SIMULATION DATA...
            </motion.div>
          )}

          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "p-3 rounded border border-l-4 text-xs md:text-sm font-mono leading-relaxed shadow-sm",
                event.type === "attack" && "border-secondary/30 border-l-secondary bg-secondary/5 text-secondary-foreground",
                event.type === "conquest" && "border-primary/30 border-l-primary bg-primary/5 text-primary-foreground",
                event.type === "collapse" && "border-yellow-500/30 border-l-yellow-500 bg-yellow-500/5 text-yellow-200",
                event.type === "alliance" && "border-blue-500/30 border-l-blue-500 bg-blue-500/5 text-blue-200",
                event.type === "WORLD EVENT" && "border-purple-500/30 border-l-purple-500 bg-purple-500/5 text-purple-200",
                event.type === "NATION FORMATION" && "border-cyan-500/30 border-l-cyan-500 bg-cyan-500/5 text-cyan-200"
              )}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">
                  {event.type === "attack" && <Shield className="w-3 h-3" />}
                  {event.type === "conquest" && <Flag className="w-3 h-3" />}
                  {event.type === "collapse" && <Skull className="w-3 h-3" />}
                  {(event.type === "WORLD EVENT" || event.type === "NATION FORMATION") && <Terminal className="w-3 h-3" />}
                </span>
                <div>
                  <div className="flex justify-between items-center mb-1 opacity-70 text-[10px] uppercase tracking-wider">
                    <span>Round {event.round}</span>
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                  <p className={cn(
                    "font-bold",
                    event.type === "conquest" && "text-glow",
                    event.type === "attack" && "text-glow-red"
                  )}>
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
