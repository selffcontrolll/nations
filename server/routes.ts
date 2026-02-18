import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gameManager } from "./game";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize game on startup
  await gameManager.initialize();

  app.get(api.simulation.getState.path, async (_req, res) => {
    const states = await storage.getAllStates();
    const events = await storage.getEvents(20); // Get last 20 events
    const status = gameManager.getStatus();
    
    // Determine winner
    const aliveOwners = new Set(states.filter(s => s.isAlive).map(s => s.ownerId));
    let winner = null;
    if (aliveOwners.size === 1) {
       const winnerId = Array.from(aliveOwners)[0];
       winner = states.find(s => s.id === winnerId) || null;
    }

    res.json({
      states,
      events,
      round: status.round,
      isActive: status.isActive,
      winner,
    });
  });

  app.post(api.simulation.start.path, (_req, res) => {
    gameManager.start();
    res.json({ message: "Simulation started" });
  });

  app.post(api.simulation.stop.path, (_req, res) => {
    gameManager.stop();
    res.json({ message: "Simulation stopped" });
  });

  app.post(api.simulation.reset.path, async (_req, res) => {
    await gameManager.resetGame();
    res.json({ message: "Simulation reset" });
  });

  app.post(api.simulation.nextTurn.path, async (_req, res) => {
    await gameManager.nextTurn();
    res.json({ message: "Turn advanced" });
  });

  app.post(api.simulation.setSpeed.path, (req, res) => {
    const { interval } = req.body;
    gameManager.setSpeed(interval);
    res.json({ message: `Speed set to ${interval}ms` });
  });

  return httpServer;
}
