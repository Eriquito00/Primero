import WebSocket from "ws";

export type CardColor = "red" | "blue" | "yellow" | "green";
export type CardValue =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "skip"
  | "reverse"
  | "draw2";

export type Card = {
  color: CardColor;
  value: CardValue;
};

export type Player = {
  id: string;
  name: string;
  ws: WebSocket;
  hand: Card[];
  saidUno: boolean;
};

export type RoomStatus = "waiting" | "playing";

export type Room = {
  code: string;
  ownerId: string;
  players: Player[];
  deck: Card[];
  pile: Card[];
  direction: 1 | -1;
  currentPlayerIndex: number;
  status: RoomStatus;
};
