import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { State } from "@shared/schema";
import { motion } from "framer-motion";

// US TopoJSON URL - widely available standard map
const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface TacticalMapProps {
  statesData: State[];
  onStateHover: (state: State | null) => void;
}

export function TacticalMap({ statesData, onStateHover }: TacticalMapProps) {
  // Create a lookup map for faster access during render
  const stateLookup = useMemo(() => {
    const lookup = new Map<string, State>();
    statesData.forEach((s) => lookup.set(s.name, s));
    return lookup;
  }, [statesData]);

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-background/50 border border-border border-glow rounded-lg">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.05)_0%,transparent_70%)]" />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, var(--primary) 25%, var(--primary) 26%, transparent 27%, transparent 74%, var(--primary) 75%, var(--primary) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, var(--primary) 25%, var(--primary) 26%, transparent 27%, transparent 74%, var(--primary) 75%, var(--primary) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}
      />

      <ComposableMap projection="geoAlbersUsa" className="w-full h-full max-h-[80vh]">
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const stateData = stateLookup.get(stateName);
              
              const ownerData = stateData ? statesData.find(s => s.id === stateData.ownerId) : null;
              
              // Use owner's color if territory is captured
              const fillColor = ownerData ? ownerData.color : (stateData ? stateData.color : "#1a1a1a");
              const isAlive = stateData?.isAlive ?? true;

              // Find current owner's display data for tooltips
              const displayData = ownerData || stateData;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    if (displayData) onStateHover(displayData);
                  }}
                  onMouseLeave={() => {
                    onStateHover(null);
                  }}
                  style={{
                    default: {
                      fill: fillColor,
                      stroke: "var(--background)",
                      strokeWidth: 1,
                      outline: "none",
                      transition: "all 250ms ease",
                      opacity: isAlive ? 0.8 : 0.3,
                    },
                    hover: {
                      fill: fillColor,
                      stroke: "var(--primary)",
                      strokeWidth: 2,
                      outline: "none",
                      opacity: 1,
                      cursor: "crosshair",
                      filter: "drop-shadow(0 0 8px var(--primary))",
                    },
                    pressed: {
                      fill: fillColor,
                      stroke: "var(--secondary)",
                      strokeWidth: 2,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary" />
    </div>
  );
}
