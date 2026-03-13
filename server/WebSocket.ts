import WebSocket, { WebSocketServer } from "ws";
import { Server } from "http";
import {
  ClientFailError,
  parseClientMessage,
  success,
  fail,
  error,
} from "./ws/protocol";
import { dispatch } from "./ws/dispatcher";
import { leaveOnDisconnect } from "./ws/game";

export function initializeWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket) => {
    const playerId = crypto.randomUUID();
    console.log("Cliente conectado: " + playerId);

    ws.on("message", async (message) => {
      let currentMsg: { type?: string; id?: string; payload?: unknown } = {};

      try {
        const parsedResult = parseClientMessage(message.toString());

        if (!parsedResult.ok) {
          ws.send(JSON.stringify(parsedResult.response));
          return;
        }

        currentMsg = parsedResult.msg;

        const result = await dispatch(
          parsedResult.msg.type,
          parsedResult.msg.payload,
          { ws, wss, playerId },
        );

        if (!result.found) {
          ws.send(
            JSON.stringify(
              fail(
                parsedResult.msg.type,
                parsedResult.msg.id,
                "type no soportado",
              ),
            ),
          );
          return;
        }

        ws.send(
          JSON.stringify(
            success(parsedResult.msg.type, parsedResult.msg.id, result.result),
          ),
        );
      } catch (err) {
        if (err instanceof ClientFailError) {
          ws.send(
            JSON.stringify(fail(currentMsg.type, currentMsg.id, err.message)),
          );
          return;
        }

        ws.send(
          JSON.stringify(
            error(currentMsg.type, currentMsg.id, "Error interno"),
          ),
        );
      }
    });

    ws.on("close", () => {
      leaveOnDisconnect(playerId);
      console.log("Cliente desconectado");
    });
  });
}
