import WebSocket from "ws";
import { ClientFailError } from "../protocol";
import { shuffle } from "./deck";
import { broadcastSimple, broadcastState } from "./events";
import { ensureName } from "./shared";
import { playerToRoom, rooms } from "./store";
import { Room } from "./types";

function generateRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function uniqueRoomCode(): string {
  let attempts = 0;
  while (attempts < 20) {
    const code = generateRoomCode();
    if (!rooms.has(code)) {
      return code;
    }
    attempts += 1;
  }

  throw new Error("No se pudo generar código de sala único");
}

export function createRoom(playerId: string, ws: WebSocket, payload: unknown) {
  if (playerToRoom.has(playerId)) {
    throw new ClientFailError("Ya estás en una sala");
  }

  const obj = (payload ?? {}) as { name?: unknown };
  const name = ensureName(obj.name);

  const code = uniqueRoomCode();
  const room: Room = {
    code,
    ownerId: playerId,
    players: [{ id: playerId, name, ws, hand: [], saidUno: false }],
    deck: [],
    pile: [],
    direction: 1,
    currentPlayerIndex: 0,
    status: "waiting",
  };

  rooms.set(code, room);
  playerToRoom.set(playerId, code);

  broadcastState(room);

  return { code, youAreOwner: true };
}

export function joinRoom(playerId: string, ws: WebSocket, payload: unknown) {
  if (playerToRoom.has(playerId)) {
    throw new ClientFailError("Ya estás en una sala");
  }

  const obj = (payload ?? {}) as { name?: unknown; code?: unknown };
  const name = ensureName(obj.name);

  if (typeof obj.code !== "string" || obj.code.trim() === "") {
    throw new ClientFailError("code es obligatorio");
  }

  const code = obj.code.trim().toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    throw new ClientFailError("Sala no encontrada");
  }

  if (room.status !== "waiting") {
    throw new ClientFailError("La partida ya empezó");
  }

  if (room.players.length >= 4) {
    throw new ClientFailError("La sala está llena");
  }

  const duplicateName = room.players.some(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicateName) {
    throw new ClientFailError("Ese nombre ya está en uso en la sala");
  }

  room.players.push({ id: playerId, name, ws, hand: [], saidUno: false });
  playerToRoom.set(playerId, room.code);

  broadcastState(room);

  return { code: room.code, joined: true };
}

export function leaveOnDisconnect(playerId: string) {
  const code = playerToRoom.get(playerId);
  if (!code) {
    return;
  }

  const room = rooms.get(code);
  playerToRoom.delete(playerId);

  if (!room) {
    return;
  }

  const index = room.players.findIndex((p) => p.id === playerId);
  if (index === -1) {
    return;
  }

  const leaving = room.players[index];

  room.deck.push(...leaving.hand);
  room.deck = shuffle(room.deck);

  room.players.splice(index, 1);

  if (room.players.length === 0) {
    rooms.delete(room.code);
    return;
  }

  if (room.ownerId === playerId) {
    room.ownerId = room.players[0].id;
  }

  if (room.currentPlayerIndex >= room.players.length) {
    room.currentPlayerIndex = 0;
  }

  if (index < room.currentPlayerIndex) {
    room.currentPlayerIndex -= 1;
  }

  if (room.status === "playing" && room.players.length < 2) {
    broadcastSimple(room, "game.over", {
      winnerId: room.players[0].id,
      winnerName: room.players[0].name,
      reason: "Resto de jugadores desconectados",
    });

    playerToRoom.delete(room.players[0].id);
    rooms.delete(room.code);
    return;
  }

  broadcastSimple(room, "room.playerLeft", {
    playerId: leaving.id,
    playerName: leaving.name,
  });
  broadcastState(room);
}
