import { Player, Room } from "./types";

export const rooms = new Map<string, Room>();
export const playerToRoom = new Map<string, string>();

/** Tiempo (ms) que un jugador tiene para reconectarse antes de ser eliminado de la partida. */
export const RECONNECT_WINDOW_MS = 10_000;

export type DisconnectedEntry = {
  room: Room;
  player: Player;
};

/** Jugadores que se desconectaron durante una partida activa, esperando reconexión. */
export const disconnected = new Map<string, DisconnectedEntry>();

/** Timers de expulsión por desconexión. Clave: `name:code` en minúsculas. */
export const disconnectTimers = new Map<
  string,
  ReturnType<typeof setTimeout>
>();
