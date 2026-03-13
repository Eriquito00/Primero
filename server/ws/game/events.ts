import WebSocket from "ws";
import { success } from "../protocol";
import { playerInRoom } from "./shared";
import { Room } from "./types";

export function buildStateForPlayer(room: Room, playerId: string) {
  const self = playerInRoom(room, playerId);

  return {
    code: room.code,
    status: room.status,
    ownerId: room.ownerId,
    direction: room.direction,
    currentPlayerId: room.players[room.currentPlayerIndex]?.id,
    deckCount: room.deck.length,
    pileTop: room.pile[room.pile.length - 1] ?? null,
    pileCount: room.pile.length,
    self: {
      id: self.id,
      name: self.name,
      hand: self.hand,
      handCount: self.hand.length,
      saidUno: self.saidUno,
    },
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      handCount: p.hand.length,
      saidUno: p.saidUno,
      isOwner: p.id === room.ownerId,
    })),
  };
}

export function sendEvent(ws: WebSocket, type: string, data: unknown): void {
  ws.send(JSON.stringify(success(type, undefined, data)));
}

export function broadcastState(room: Room): void {
  for (const player of room.players) {
    sendEvent(player.ws, "game.state", buildStateForPlayer(room, player.id));
  }
}

export function broadcastSimple(room: Room, type: string, data: unknown): void {
  for (const player of room.players) {
    sendEvent(player.ws, type, data);
  }
}
