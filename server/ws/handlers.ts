import { WSHandler } from "./types";
import {
  catchUno,
  createRoom,
  drawCard,
  joinRoom,
  playCard,
  reconnectToGame,
  sayUno,
  startGame,
} from "./game";

const pingHandler: WSHandler = async () => {
  return { pong: true, at: new Date().toISOString() };
};

const roomCreateHandler: WSHandler = (payload, ctx) => {
  return createRoom(ctx.playerId, ctx.ws, payload);
};

const roomJoinHandler: WSHandler = (payload, ctx) => {
  return joinRoom(ctx.playerId, ctx.ws, payload);
};

const gameStartHandler: WSHandler = (_payload, ctx) => {
  return startGame(ctx.playerId);
};

const gamePlayCardHandler: WSHandler = (payload, ctx) => {
  return playCard(ctx.playerId, payload);
};

const gameDrawCardHandler: WSHandler = (_payload, ctx) => {
  return drawCard(ctx.playerId);
};

const gameSayUnoHandler: WSHandler = (_payload, ctx) => {
  return sayUno(ctx.playerId);
};

const gameCatchUnoHandler: WSHandler = (payload, ctx) => {
  return catchUno(ctx.playerId, payload);
};

const gameReconnectHandler: WSHandler = (payload, ctx) => {
  return reconnectToGame(ctx.playerId, ctx.ws, payload);
};

export const handlers: Record<string, WSHandler> = {
  ping: pingHandler,
  "room.create": roomCreateHandler,
  "room.join": roomJoinHandler,
  "game.start": gameStartHandler,
  "game.playCard": gamePlayCardHandler,
  "game.drawCard": gameDrawCardHandler,
  "game.sayUno": gameSayUnoHandler,
  "game.catchUno": gameCatchUnoHandler,
  "game.reconnect": gameReconnectHandler,
};
