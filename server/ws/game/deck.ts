import { ClientFailError } from "../protocol";
import { Card, CardColor, CardValue, Room } from "./types";

export function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function buildDeck(): Card[] {
  const colors: CardColor[] = ["red", "blue", "yellow", "green"];
  const deck: Card[] = [];

  for (const color of colors) {
    deck.push({ color, value: "0" });

    for (let n = 1; n <= 9; n++) {
      deck.push({ color, value: String(n) as CardValue });
      deck.push({ color, value: String(n) as CardValue });
    }

    deck.push({ color, value: "skip" });
    deck.push({ color, value: "skip" });
    deck.push({ color, value: "reverse" });
    deck.push({ color, value: "reverse" });
    deck.push({ color, value: "draw2" });
    deck.push({ color, value: "draw2" });
  }

  return shuffle(deck);
}

export function drawOne(room: Room): Card {
  if (room.deck.length === 0) {
    if (room.pile.length <= 1) {
      throw new ClientFailError("No quedan cartas para robar");
    }

    const top = room.pile[room.pile.length - 1];
    const refill = room.pile.slice(0, -1);
    room.deck = shuffle(refill);
    room.pile = [top];
  }

  const card = room.deck.pop();
  if (!card) {
    throw new ClientFailError("No quedan cartas para robar");
  }

  return card;
}

export function isPlayable(card: Card, top: Card): boolean {
  return card.color === top.color || card.value === top.value;
}
