import { ClientFailError } from "../protocol";
import { playerToRoom, rooms } from "./store";
import { Player, Room } from "./types";

export function ensureName(name: unknown): string {
  if (typeof name !== "string") {
    throw new ClientFailError("name debe ser un string");
  }

  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 16) {
    throw new ClientFailError("name debe tener entre 2 y 16 caracteres");
  }

  return trimmed;
}

export function roomOfPlayer(playerId: string): Room {
  const code = playerToRoom.get(playerId);
  if (!code) {
    throw new ClientFailError("No estás en ninguna sala");
  }

  const room = rooms.get(code);
  if (!room) {
    playerToRoom.delete(playerId);
    throw new ClientFailError("La sala ya no existe");
  }

  return room;
}

export function playerInRoom(room: Room, playerId: string): Player {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    throw new ClientFailError("Jugador no encontrado en la sala");
  }
  return player;
}

export function currentPlayer(room: Room): Player {
  if (room.players.length === 0) {
    throw new ClientFailError("No hay jugadores en la sala");
  }
  return room.players[room.currentPlayerIndex];
}

export function nextIndex(room: Room, steps = 1): number {
  const n = room.players.length;
  if (n === 0) {
    return 0;
  }

  const raw = room.currentPlayerIndex + room.direction * steps;
  return ((raw % n) + n) % n;
}
