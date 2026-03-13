import { ClientFailError } from "../protocol";
import { buildDeck, drawOne, isPlayable } from "./deck";
import { broadcastSimple, broadcastState } from "./events";
import { currentPlayer, nextIndex, playerInRoom, roomOfPlayer } from "./shared";
import { playerToRoom, rooms } from "./store";

export function startGame(playerId: string) {
  const room = roomOfPlayer(playerId);

  if (room.ownerId !== playerId) {
    throw new ClientFailError("Solo el creador puede iniciar");
  }

  if (room.status !== "waiting") {
    throw new ClientFailError("La partida ya está en curso");
  }

  if (room.players.length < 2) {
    throw new ClientFailError("Se necesitan al menos 2 jugadores");
  }

  room.status = "playing";
  room.direction = 1;
  room.currentPlayerIndex = 0;
  room.deck = buildDeck();
  room.pile = [];

  for (const player of room.players) {
    player.hand = [];
    player.saidUno = false;
    for (let i = 0; i < 7; i++) {
      player.hand.push(drawOne(room));
    }
  }

  room.pile.push(drawOne(room));

  broadcastState(room);

  return { started: true, code: room.code };
}

export function playCard(playerId: string, payload: unknown) {
  const room = roomOfPlayer(playerId);

  if (room.status !== "playing") {
    throw new ClientFailError("La partida no está iniciada");
  }

  const player = playerInRoom(room, playerId);
  if (currentPlayer(room).id !== player.id) {
    throw new ClientFailError("No es tu turno");
  }

  const obj = (payload ?? {}) as { cardIndex?: unknown };
  if (typeof obj.cardIndex !== "number" || !Number.isInteger(obj.cardIndex)) {
    throw new ClientFailError("cardIndex debe ser un entero");
  }

  if (obj.cardIndex < 0 || obj.cardIndex >= player.hand.length) {
    throw new ClientFailError("cardIndex fuera de rango");
  }

  const top = room.pile[room.pile.length - 1];
  const card = player.hand[obj.cardIndex];
  if (!top || !isPlayable(card, top)) {
    throw new ClientFailError(
      "La carta no se puede jugar sobre la pila actual",
    );
  }

  player.hand.splice(obj.cardIndex, 1);
  room.pile.push(card);

  if (player.hand.length === 1) {
    player.saidUno = false;
  }

  if (player.hand.length === 0) {
    broadcastSimple(room, "game.over", {
      winnerId: player.id,
      winnerName: player.name,
      code: room.code,
    });

    for (const p of room.players) {
      playerToRoom.delete(p.id);
    }
    rooms.delete(room.code);

    return { won: true, winnerId: player.id, winnerName: player.name };
  }

  let steps = 1;

  if (card.value === "draw2") {
    const targetIndex = nextIndex(room, 1);
    const target = room.players[targetIndex];
    target.hand.push(drawOne(room));
    target.hand.push(drawOne(room));
    target.saidUno = false;
    steps = 2;
  } else if (card.value === "skip") {
    steps = 2;
  } else if (card.value === "reverse") {
    if (room.players.length === 2) {
      steps = 2;
    } else {
      room.direction = room.direction === 1 ? -1 : 1;
      steps = 1;
    }
  }

  room.currentPlayerIndex = nextIndex(room, steps);

  broadcastState(room);

  return {
    played: card,
    nextPlayerId: room.players[room.currentPlayerIndex]?.id,
  };
}

export function drawCard(playerId: string) {
  const room = roomOfPlayer(playerId);

  if (room.status !== "playing") {
    throw new ClientFailError("La partida no está iniciada");
  }

  const player = playerInRoom(room, playerId);
  if (currentPlayer(room).id !== player.id) {
    throw new ClientFailError("No es tu turno");
  }

  const card = drawOne(room);
  player.hand.push(card);
  player.saidUno = false;

  room.currentPlayerIndex = nextIndex(room, 1);

  broadcastState(room);

  return { drew: true, card };
}

export function sayUno(playerId: string) {
  const room = roomOfPlayer(playerId);
  if (room.status !== "playing") {
    throw new ClientFailError("La partida no está iniciada");
  }

  const player = playerInRoom(room, playerId);
  if (player.hand.length !== 1) {
    throw new ClientFailError("Solo puedes decir UNO con 1 carta");
  }

  player.saidUno = true;

  broadcastSimple(room, "game.uno", {
    playerId: player.id,
    playerName: player.name,
  });
  broadcastState(room);

  return { saidUno: true };
}

export function catchUno(playerId: string, payload: unknown) {
  const room = roomOfPlayer(playerId);
  if (room.status !== "playing") {
    throw new ClientFailError("La partida no está iniciada");
  }

  const obj = (payload ?? {}) as { targetPlayerId?: unknown };
  if (
    typeof obj.targetPlayerId !== "string" ||
    obj.targetPlayerId.trim() === ""
  ) {
    throw new ClientFailError("targetPlayerId es obligatorio");
  }

  const targetId = obj.targetPlayerId.trim();
  if (targetId === playerId) {
    throw new ClientFailError("No puedes cazarte a ti mismo");
  }

  const target = room.players.find((p) => p.id === targetId);
  if (!target) {
    throw new ClientFailError("Jugador objetivo no encontrado");
  }

  if (target.hand.length !== 1) {
    throw new ClientFailError("El jugador objetivo no tiene 1 carta");
  }

  if (target.saidUno) {
    throw new ClientFailError("Ese jugador ya dijo UNO");
  }

  target.hand.push(drawOne(room));
  target.saidUno = false;

  const hunter = playerInRoom(room, playerId);
  broadcastSimple(room, "game.unoCaught", {
    targetPlayerId: target.id,
    targetPlayerName: target.name,
    byPlayerId: hunter.id,
    byPlayerName: hunter.name,
    penaltyCards: 1,
  });
  broadcastState(room);

  return { caught: true, targetPlayerId: target.id };
}
