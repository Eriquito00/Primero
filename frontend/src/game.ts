import "./components/Card.js";
import { Card } from "./components/Card.js";
import { loadPlayers, showCardInThrowZone } from "./game.ui.js";

// ── Tipos que reflejan exactamente lo que manda el backend ──────────────────
type GameCard = {
  color: "red" | "blue" | "yellow" | "green";
  value: string;
};

type GameSelf = {
  id: string;
  name: string;
  hand: GameCard[];
  handCount: number;
  saidUno: boolean;
};

type GamePlayerInfo = {
  id: string;
  name: string;
  handCount: number;
  saidUno: boolean;
  isOwner: boolean;
};

type GameState = {
  code: string;
  status: "waiting" | "playing";
  ownerId: string;
  direction: 1 | -1;
  currentPlayerId: string;
  deckCount: number;
  pileTop: GameCard | null;
  pileCount: number;
  self: GameSelf;
  players: GamePlayerInfo[];
};

// ── DOM ─────────────────────────────────────────────────────────────────────
const board = document.getElementById("board") as HTMLElement;
const table = document.getElementById("users") as HTMLTableElement;
const dropZone = document.getElementById("table") as HTMLElement;
const deckBtn = document.getElementById("deck") as HTMLButtonElement;
const primeroBtn = document.getElementById("primero") as HTMLButtonElement;

// ── Estado ──────────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  name: "primero.name",
  code: "primero.code",
  state: "primero.roomState",
};

let wsClient: {
  connect: (url: string) => Promise<void>;
  on: (
    type: string,
    cb: (msg: { data?: unknown; status: string; message?: string }) => void,
  ) => () => void;
  request: (
    type: string,
    payload: unknown,
  ) => Promise<{ data?: unknown; status: string; message?: string }>;
  close: () => void;
} | null = null;

let roomCode = "";
let playerName = "";
let currentState: GameState | null = null;

// ── Arranque ─────────────────────────────────────────────────────────────────
void initGame();

async function initGame() {
  const urlParams = new URLSearchParams(window.location.search);
  roomCode =
    urlParams.get("code")?.toUpperCase() ??
    sessionStorage.getItem(STORAGE_KEYS.code) ??
    "";
  playerName = sessionStorage.getItem(STORAGE_KEYS.name) ?? "";

  if (roomCode.length !== 6 || playerName.length < 2) {
    window.location.href = "./../";
    return;
  }

  sessionStorage.setItem(STORAGE_KEYS.code, roomCode);

  // Renderizar estado cacheado para que la UI aparezca inmediatamente
  const cached = sessionStorage.getItem(STORAGE_KEYS.state);
  if (cached !== null) {
    try {
      renderGameState(JSON.parse(cached) as GameState);
    } catch {
      /* ignorar cache corrupta */
    }
  }

  try {
    const { WsClient } = await import("./services/websocket.js");
    wsClient = new WsClient();
    await wsClient.connect(getWsUrl());

    // Estado actualizado en tiempo real
    wsClient.on("game.state", (msg) => {
      const state = msg.data as GameState | undefined;
      if (state !== undefined) renderGameState(state);
    });

    // Fin de partida
    wsClient.on("game.over", (msg) => {
      const data = msg.data as
        | { winnerName?: string; reason?: string }
        | undefined;
      const text = data?.winnerName
        ? `¡${data.winnerName} ha ganado!`
        : (data?.reason ?? "La partida ha terminado.");
      alert(text);
      sessionStorage.removeItem(STORAGE_KEYS.state);
      window.location.href = "./../";
    });

    // Alguien dijo UNO → mostrar botón de cazar
    wsClient.on("game.uno", (msg) => {
      const data = msg.data as
        | { playerId: string; playerName: string }
        | undefined;
      if (data !== undefined && data.playerId !== currentState?.self.id) {
        showCatchButton(data.playerId, data.playerName);
      }
    });

    // Notificación de UNO cazado
    wsClient.on("game.unoCaught", (msg) => {
      const data = msg.data as
        | { targetPlayerName?: string; byPlayerName?: string }
        | undefined;
      if (data?.targetPlayerName && data?.byPlayerName) {
        showNotification(
          `¡${data.byPlayerName} cazó a ${data.targetPlayerName}!`,
        );
      }
    });

    // Jugador abandonó
    wsClient.on("room.playerLeft", (msg) => {
      const data = msg.data as { playerName?: string } | undefined;
      if (data?.playerName)
        showNotification(`${data.playerName} se ha desconectado`);
    });

    // Reconectar al juego (nueva conexión tras navegar desde room.html)
    const res = await wsClient.request("game.reconnect", {
      name: playerName,
      code: roomCode,
    });
    const state = res.data as GameState | undefined;
    if (state !== undefined) renderGameState(state);
  } catch (error) {
    const wsError = error as { data?: { reason?: string }; message?: string };
    alert(
      wsError.data?.reason ??
        wsError.message ??
        "No se pudo conectar con la partida.",
    );
    window.location.href = "./../";
    return;
  }

  // ── Listeners de acción ──────────────────────────────────────────────────
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drop_over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drop_over");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drop_over");
    void playDraggedCard(e);
  });

  deckBtn.addEventListener("click", () => void drawCard());
  primeroBtn.addEventListener("click", () => void sayUno());
}

// ── Render ───────────────────────────────────────────────────────────────────
function renderGameState(state: GameState) {
  currentState = state;
  sessionStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state));

  if (state.code) {
    roomCode = state.code;
    sessionStorage.setItem(STORAGE_KEYS.code, state.code);
  }

  // Mi mano
  renderHand(state.self.hand);

  // Tabla de jugadores con turno resaltado
  const playersMap: Record<string, number> = {};
  for (const p of state.players) {
    playersMap[p.name] = p.handCount;
  }
  const currentPlayerName = state.players.find(
    (p) => p.id === state.currentPlayerId,
  )?.name;
  loadPlayers(playersMap, table, currentPlayerName);

  // Carta superior de la pila
  if (state.pileTop !== null) {
    showCardInThrowZone(dropZone, state.pileTop);
  }

  // Indicador de turno
  const isMyTurn = state.self.id === state.currentPlayerId;
  deckBtn.style.opacity = isMyTurn ? "1" : "0.45";
  deckBtn.title = isMyTurn ? "Robar carta" : "No es tu turno";

  // Botón primero: activo solo si tienes exactamente 1 carta
  primeroBtn.style.opacity = state.self.hand.length === 1 ? "1" : "0.4";
  primeroBtn.title = state.self.hand.length === 1 ? "¡Di UNO!" : "";
}

function renderHand(hand: GameCard[]) {
  board.innerHTML = "";
  hand.forEach((card, index) => {
    const element = new Card(card.color, getCardLabel(card.value)).createCard();
    element.dataset.cardIndex = index.toString();
    // Sobreescribir drag data para incluir el índice (más fiable que buscar por color+valor)
    element.addEventListener("dragstart", (e) => {
      (e as DragEvent).dataTransfer?.setData(
        "application/json",
        JSON.stringify({ cardIndex: index }),
      );
    });
    board.appendChild(element);
  });
}

// ── Acciones de juego ─────────────────────────────────────────────────────────
async function playDraggedCard(event: Event) {
  if (wsClient === null) return;

  const dragEvent = event as DragEvent;
  const source = dragEvent.dataTransfer?.getData("application/json");
  if (!source) return;

  const payload = JSON.parse(source) as { cardIndex?: number };
  const cardIndex =
    typeof payload.cardIndex === "number" ? payload.cardIndex : -1;

  if (cardIndex < 0) {
    alert("No se pudo identificar la carta.");
    return;
  }

  try {
    await wsClient.request("game.playCard", { cardIndex });
  } catch (error) {
    const wsError = error as { data?: { reason?: string }; message?: string };
    alert(
      wsError.data?.reason ?? wsError.message ?? "No se pudo jugar la carta.",
    );
  }
}

async function drawCard() {
  if (wsClient === null) return;
  try {
    await wsClient.request("game.drawCard", {});
  } catch (error) {
    const wsError = error as { data?: { reason?: string }; message?: string };
    alert(wsError.data?.reason ?? wsError.message ?? "No se pudo robar carta.");
  }
}

async function sayUno() {
  if (wsClient === null) return;
  try {
    await wsClient.request("game.sayUno", {});
  } catch (error) {
    const wsError = error as { data?: { reason?: string }; message?: string };
    alert(wsError.data?.reason ?? wsError.message ?? "No se pudo decir UNO.");
  }
}

async function catchUno(targetPlayerId: string) {
  if (wsClient === null) return;
  try {
    await wsClient.request("game.catchUno", { targetPlayerId });
  } catch (error) {
    const wsError = error as { data?: { reason?: string }; message?: string };
    alert(
      wsError.data?.reason ?? wsError.message ?? "No se pudo cazar el UNO.",
    );
  }
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showCatchButton(targetId: string, targetName: string) {
  document.getElementById("catch_uno_btn")?.remove();

  const btn = document.createElement("button");
  btn.id = "catch_uno_btn";
  btn.textContent = `¡Cazar a ${targetName}!`;
  btn.style.cssText = [
    "position:fixed",
    "bottom:24px",
    "right:24px",
    "background:linear-gradient(145deg,#cc0000,#800000)",
    "color:white",
    "border:none",
    "border-radius:12px",
    "padding:14px 22px",
    "font-weight:bold",
    "font-size:1rem",
    "cursor:pointer",
    "z-index:999",
    "box-shadow:0 4px 12px rgba(0,0,0,0.5)",
    "animation:pulse 0.6s ease infinite alternate",
  ].join(";");

  btn.onclick = () => {
    void catchUno(targetId);
    btn.remove();
  };
  document.body.appendChild(btn);

  // Auto-desaparecer a los 5 segundos
  setTimeout(() => btn.remove(), 5000);
}

function showNotification(text: string, duration = 3000) {
  const el = document.createElement("div");
  el.style.cssText = [
    "position:fixed",
    "top:20px",
    "left:50%",
    "transform:translateX(-50%)",
    "background:rgba(0,0,0,0.85)",
    "color:white",
    "padding:12px 20px",
    "border-radius:10px",
    "font-weight:bold",
    "font-size:1rem",
    "z-index:999",
    "transition:opacity 0.3s",
    "pointer-events:none",
  ].join(";");
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, duration);
}

// ── Utilidades ────────────────────────────────────────────────────────────────
function getCardLabel(value: string): string {
  if (value === "skip") return "⊘";
  if (value === "reverse") return "↺";
  if (value === "draw2") return "+2";
  return value;
}

function getWsUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const configuredHost = localStorage.getItem("primero.wsHost")?.trim();
  const host =
    configuredHost && configuredHost.length > 0
      ? configuredHost
      : `${window.location.hostname}:3000`;
  return `${protocol}//${host}`;
}

window.addEventListener("beforeunload", () => {
  wsClient?.close();
});
