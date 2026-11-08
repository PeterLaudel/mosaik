import { OutboxEventType } from "./repository";

/** Inbound protocol for outbox events: features export these, the worker dispatches to them. */
export interface OutboxHandler {
  eventType: OutboxEventType;
  handle(payload: unknown): Promise<void>;
}
