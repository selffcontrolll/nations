import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Tables ---

export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name"), // e.g., 'The Republic of California'
  code: text("code").notNull(), // e.g., 'CA', 'NY'
  lat: integer("lat").notNull(), // Multiplied by 10000 for integer storage
  lng: integer("lng").notNull(), // Multiplied by 10000 for integer storage
  ownerId: integer("owner_id"), // ID of the state that currently owns this territory
  color: text("color").notNull(), // Hex code
  isAlive: boolean("is_alive").default(true).notNull(),
  population: integer("population").default(100).notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull(),
  type: text("type").notNull(), // 'attack', 'alliance', 'collapse'
  description: text("description").notNull(),
  attackerId: integer("attacker_id"),
  targetId: integer("target_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Schemas ---

export const insertStateSchema = createInsertSchema(states).omit({ id: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });

// --- Types ---

export type State = typeof states.$inferSelect;
export type InsertState = z.infer<typeof insertStateSchema>;

export type GameEvent = typeof events.$inferSelect;
export type InsertGameEvent = z.infer<typeof insertEventSchema>;

export type StateStatus = State & {
  territoryCount: number;
};
