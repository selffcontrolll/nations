import { db } from "./db";
import { states, events, type State, type InsertState, type GameEvent, type InsertGameEvent } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // State operations
  getAllStates(): Promise<State[]>;
  getState(id: number): Promise<State | undefined>;
  updateState(id: number, updates: Partial<State>): Promise<State>;
  resetStates(initialStates: InsertState[]): Promise<void>;
  
  // Event operations
  getEvents(limit?: number): Promise<GameEvent[]>;
  createEvent(event: InsertGameEvent): Promise<GameEvent>;
  clearEvents(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllStates(): Promise<State[]> {
    return await db.select().from(states).orderBy(states.id);
  }

  async getState(id: number): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.id, id));
    return state;
  }

  async updateState(id: number, updates: Partial<State>): Promise<State> {
    const [updated] = await db.update(states)
      .set(updates)
      .where(eq(states.id, id))
      .returning();
    return updated;
  }

  async resetStates(initialStates: InsertState[]): Promise<void> {
    await db.delete(states);
    // Insert in batches if needed, but 50 is small enough
    if (initialStates.length > 0) {
        await db.insert(states).values(initialStates);
    }
  }

  async getEvents(limit: number = 50): Promise<GameEvent[]> {
    return await db.select()
      .from(events)
      .orderBy(sql`${events.id} DESC`) // Newest first
      .limit(limit);
  }

  async createEvent(event: InsertGameEvent): Promise<GameEvent> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async clearEvents(): Promise<void> {
    await db.delete(events);
  }
}

export const storage = new DatabaseStorage();
