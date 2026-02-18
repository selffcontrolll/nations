import { storage } from "./storage";
import { US_STATES, getNeighbors } from "./data/states";
import { openai } from "./replit_integrations/audio/client"; // Reusing the OpenAI client from the audio integration
import { type InsertGameEvent } from "@shared/schema";

export class GameManager {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private round: number = 0;
  private intervalMs: number = 2000;

  constructor() {}

  async initialize() {
    // Check if states exist, if not seed them
    const states = await storage.getAllStates();
    if (states.length === 0) {
      await this.resetGame();
    }
  }

  async resetGame() {
    this.stop();
    this.round = 0;
    
    // Create initial states
    const initialStates = US_STATES.map((s, index) => ({
      name: s.name,
      displayName: s.name,
      code: s.code,
      lat: 0, 
      lng: 0,
      ownerId: null, 
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`, 
      isAlive: true,
      population: 1000000 + Math.floor(Math.random() * 5000000), // Real-ish population
    }));

    await storage.resetStates(initialStates);
    
    // After reset, update ownerId to be self (id)
    const newStates = await storage.getAllStates();
    for (const state of newStates) {
      await storage.updateState(state.id, { ownerId: state.id });
    }

    await storage.clearEvents();
    await this.logEvent("Game Reset", "The United States has dissolved into 50 warring factions. Population centers are mobilizing.");
  }

  setSpeed(intervalMs: number) {
    this.intervalMs = intervalMs;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.nextTurn(), this.intervalMs);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async nextTurn() {
    this.round++;
    
    // 0. Population Dynamics & Random Events
    const allStates = await storage.getAllStates();
    const aliveStates = allStates.filter(s => s.isAlive);

    // Chaos Mode: Randomly nukes a territory or sparks a coup
    if (Math.random() < 0.02) {
      const victim = aliveStates[Math.floor(Math.random() * aliveStates.length)];
      if (victim) {
        await storage.updateState(victim.id, { population: Math.floor(victim.population * 0.1) });
        await this.logEvent("CIVIL WAR", `A massive civil war has erupted in ${victim.displayName || victim.name}, decimation the population!`);
      }
    }

    if (Math.random() < 0.1) { // 10% chance of a random global event
        const events = ["Famine", "Civil Unrest", "Economic Boom", "Pandemic", "Resource Discovery"];
        const event = events[Math.floor(Math.random() * events.length)];
        
        for (const s of aliveStates) {
            let popChange = 0;
            if (event === "Famine") popChange = -0.05;
            if (event === "Civil Unrest") popChange = -0.02;
            if (event === "Economic Boom") popChange = 0.05;
            if (event === "Pandemic") popChange = -0.10;
            if (event === "Resource Discovery") popChange = 0.03;
            
            await storage.updateState(s.id, { 
                population: Math.floor(s.population * (1 + popChange)) 
            });
        }
        await this.logEvent("WORLD EVENT", `A ${event} has swept through the nations, altering the population of all territories.`);
    }

    // Natural growth
    for (const s of aliveStates) {
        await storage.updateState(s.id, { population: Math.floor(s.population * 1.01) });
    }

    // 1. Pick a random alive attacker
    if (aliveStates.length <= 1) {
      this.stop();
      if (aliveStates.length === 1) {
        await this.logEvent("Game Over", `${aliveStates[0].displayName || aliveStates[0].name} has conquered the entire continent!`);
      }
      return;
    }

    const attacker = aliveStates[Math.floor(Math.random() * aliveStates.length)];
    
    // 2. Find targets
    const territories = allStates.filter(s => s.ownerId === attacker.id);
    const candidateTargets = new Set<number>();
    
    for (const t of territories) {
      const neighbors = getNeighbors(t.code);
      for (const nCode of neighbors) {
        const neighborState = allStates.find(s => s.code === nCode);
        if (neighborState && neighborState.ownerId !== attacker.id) {
          candidateTargets.add(neighborState.id);
        }
      }
    }

    if (candidateTargets.size === 0) return;

    const targetId = Array.from(candidateTargets)[Math.floor(Math.random() * candidateTargets.size)];
    const targetState = allStates.find(s => s.id === targetId);
    if (!targetState) return;

    const targetOwner = allStates.find(s => s.id === targetState.ownerId);
    if (!targetOwner) return;

    // Resolve Battle biased by population
    const attackerTotalPop = territories.reduce((sum, t) => sum + t.population, 0);
    const targetOwnerTotalPop = allStates.filter(s => s.ownerId === targetOwner.id).reduce((sum, t) => sum + t.population, 0);
    
    const winChance = 0.4 + (attackerTotalPop / (attackerTotalPop + targetOwnerTotalPop)) * 0.2;
    const attackerWins = Math.random() < winChance;

    if (attackerWins) {
      // Conquered!
      await storage.updateState(targetState.id, { ownerId: attacker.id });
      
      // Update Name of Attacker if they grow
      const attackerTerritoriesCount = allStates.filter(s => s.ownerId === attacker.id).length + 1;
      let newDisplayName = attacker.displayName || attacker.name;
      
      if (attackerTerritoriesCount >= 10 && !newDisplayName.includes("Empire")) {
          newDisplayName = `The Empire of ${attacker.name}`;
      } else if (attackerTerritoriesCount >= 5 && !newDisplayName.includes("Republic") && !newDisplayName.includes("Empire")) {
          newDisplayName = `The Republic of ${attacker.name}`;
      } else if (attackerTerritoriesCount >= 3 && !newDisplayName.includes("Confederation") && !newDisplayName.includes("Republic") && !newDisplayName.includes("Empire")) {
          newDisplayName = `The ${attacker.name} Confederation`;
      }
      
      if (newDisplayName !== attacker.displayName) {
          await storage.updateState(attacker.id, { displayName: newDisplayName });
          await this.logEvent("NATION FORMATION", `${attacker.name} has expanded enough to be known as ${newDisplayName}!`);
      }

      // Check if defender is eliminated
      const remainingDefenderTerritory = allStates.filter(s => s.ownerId === targetOwner.id && s.id !== targetState.id);
      if (remainingDefenderTerritory.length === 0) {
        await storage.updateState(targetOwner.id, { isAlive: false });
        await this.logEvent("ELIMINATION", `${targetOwner.displayName || targetOwner.name} has been wiped off the map by ${attacker.displayName || attacker.name}!`, attacker.id, targetOwner.id, "elimination");
      } else {
        await this.logEvent("CONQUEST", `${attacker.displayName || attacker.name} has captured ${targetState.name} from ${targetOwner.displayName || targetOwner.name}.`, attacker.id, targetState.id, "battle");
      }

    } else {
      await this.logEvent("DEFENSE", `${targetOwner.displayName || targetOwner.name} successfully defended ${targetState.name} against ${attacker.displayName || attacker.name}.`, attacker.id, targetState.id, "defense");
    }
  }

  async logEvent(type: string, baseDescription: string, attackerId?: number, targetId?: number, flavorType: "battle" | "elimination" | "defense" | "generic" = "generic") {
    // Generate AI flavor text
    let flavorText = baseDescription;
    
    // Only use AI for battles/eliminations to save tokens/time, or if specific flag set
    // For now, let's just wrap it.
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-5.2",
            messages: [
                { role: "system", content: "You are a war correspondent reporting on a chaotic Battle Royale between US States. Keep it short (1 sentence), funny, and slightly absurd. Mention specific stereotypes if relevant but keep it light." },
                { role: "user", content: `Write a headline for: ${baseDescription}` }
            ],
            max_completion_tokens: 60,
        });
        flavorText = completion.choices[0]?.message?.content || baseDescription;
    } catch (e) {
        console.error("AI generation failed, using fallback:", e);
    }

    const event: InsertGameEvent = {
      round: this.round,
      type,
      description: flavorText,
      attackerId,
      targetId,
    };
    await storage.createEvent(event);
  }

  getStatus() {
    return {
      round: this.round,
      isActive: this.isRunning
    };
  }
}

export const gameManager = new GameManager();
