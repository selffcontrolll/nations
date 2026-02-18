import { z } from "zod";
import { states, events, insertStateSchema, insertEventSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  simulation: {
    getState: {
      method: "GET" as const,
      path: "/api/simulation/state" as const,
      responses: {
        200: z.object({
          states: z.array(z.custom<typeof states.$inferSelect>()),
          events: z.array(z.custom<typeof events.$inferSelect>()),
          round: z.number(),
          isActive: z.boolean(),
          winner: z.custom<typeof states.$inferSelect>().nullable(),
        }),
      },
    },
    start: {
      method: "POST" as const,
      path: "/api/simulation/start" as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    stop: {
      method: "POST" as const,
      path: "/api/simulation/stop" as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    reset: {
      method: "POST" as const,
      path: "/api/simulation/reset" as const,
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    nextTurn: {
        method: "POST" as const,
        path: "/api/simulation/turn" as const,
        responses: {
            200: z.object({ message: z.string() })
        }
    },
    setSpeed: {
      method: "POST" as const,
      path: "/api/simulation/speed" as const,
      input: z.object({ interval: z.number() }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type SimulationStateResponse = z.infer<typeof api.simulation.getState.responses[200]>;
