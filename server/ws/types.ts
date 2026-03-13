import { WebSocket, WebSocketServer } from "ws";

export type JSendStatus = "success" | "fail" | "error";

export interface ClientMessage<T = unknown> {
  id?: string; // para saber a que request pertenece una response
  type: string; // definimos accion
  payload?: T;
}

export interface ServerMessage<T = unknown> {
  status: JSendStatus;
  id?: string;
  type?: string;
  data?: T;
  message?: string;
  code?: string;
}

export type HandlerContext = {
  ws: WebSocket;
  wss: WebSocketServer;
  playerId: string;
};

export type WSHandler = (
  payload: unknown,
  ctx: HandlerContext,
) => Promise<unknown> | unknown;
