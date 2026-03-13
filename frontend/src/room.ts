const room_code = document.getElementById("room_code") as HTMLTextAreaElement;
const start_game = document.getElementById("start_game") as HTMLButtonElement;

// Ocultar el botón hasta saber si somos el owner
start_game.style.display = "none";

const STORAGE_KEYS = {
  name: "primero.name",
  code: "primero.code",
};

type GameStatePlayer = {
  id: string;
  name: string;
  handCount: number;
  saidUno: boolean;
  isOwner: boolean;
};

type GameStateSelf = {
  id: string;
  name: string;
};

type RoomState = {
  code: string;
  status: "waiting" | "playing";
  ownerId: string;
  self: GameStateSelf;
  players: GameStatePlayer[];
};

let clientRef: {
  request: (type: string, payload: unknown) => Promise<{ data?: unknown }>;
  close: () => void;
} | null = null;

void initRoom();

async function initRoom() {
  const urlParams = new URLSearchParams(window.location.search);
  const createMode = urlParams.get("create") === "1";
  let roomCode =
    urlParams.get("code")?.toUpperCase() ??
    sessionStorage.getItem(STORAGE_KEYS.code) ??
    "";
  const name = sessionStorage.getItem(STORAGE_KEYS.name) ?? "";

  if (name.length < 2 || (!createMode && roomCode.length !== 6)) {
    window.location.href = "./../";
    return;
  }

  const playersList = ensurePlayersList();

  try {
    const { WsClient } = await import("./services/websocket.js");
    const wsClient = new WsClient();
    clientRef = wsClient;

    await wsClient.connect(getWsUrl());

    // Listener de estado: actualiza UI y navega cuando la partida comienza
    wsClient.on("game.state", (msg) => {
      const state = msg.data as RoomState | undefined;
      if (state === undefined) return;
      updateRoomState(state, playersList, roomCode);
      roomCode = state.code;
    });

    if (createMode) {
      // Crear sala — el backend ya añade al creador, no hay que hacer join
      const res = await wsClient.request("room.create", { name });
      const data = res.data as { code?: string } | undefined;
      if (data?.code === undefined)
        throw new Error("El backend no devolvió código de sala.");

      roomCode = data.code.toUpperCase();
      room_code.value = roomCode;
      sessionStorage.setItem(STORAGE_KEYS.code, roomCode);
      window.history.replaceState(
        null,
        "",
        `./index.html?code=${encodeURIComponent(roomCode)}`,
      );
    } else {
      // Unirse a sala existente
      if (roomCode.length !== 6) {
        window.location.href = "./../";
        return;
      }
      room_code.value = roomCode;
      await wsClient.request("room.join", { name, code: roomCode });
      // El game.state broadcast actualizará la lista de jugadores
    }

    start_game.addEventListener("click", () => {
      void startGame();
    });
  } catch (error) {
    const wsError = error as { data?: { reason?: string }; message?: string };
    alert(
      wsError.data?.reason ??
        wsError.message ??
        "No se pudo conectar a la sala.",
    );
    window.location.href = "./../";
  }
}

async function startGame() {
  if (clientRef === null) {
    alert("Conexión no disponible.");
    return;
  }
  try {
    await clientRef.request("game.start", {});
    // La navegación la dispara el game.state listener cuando status=playing
  } catch (error) {
    const wsError = error as { data?: { reason?: string }; message?: string };
    alert(
      wsError.data?.reason ??
        wsError.message ??
        "No se pudo iniciar la partida.",
    );
  }
}

function updateRoomState(
  state: RoomState,
  playersList: HTMLUListElement,
  roomCode: string,
) {
  renderPlayers(state.players, playersList);

  // Mostrar / ocultar botón de inicio según si somos el owner
  const iAmOwner = state.self !== undefined && state.self.id === state.ownerId;
  if (iAmOwner) {
    start_game.style.display = "block";
    start_game.disabled = state.players.length < 2;
    start_game.title =
      state.players.length < 2 ? "Necesitas al menos 2 jugadores" : "";
  } else {
    start_game.style.display = "none";
  }

  // Navegar a la partida cuando empiece
  if (state.status === "playing") {
    window.location.href = `./../game/index.html?code=${encodeURIComponent(state.code || roomCode)}`;
  }
}

function ensurePlayersList(): HTMLUListElement {
  const container = document.querySelector(".room_container") as HTMLElement;
  let list = document.getElementById("players_list") as HTMLUListElement | null;
  if (list !== null) return list;

  const title = document.createElement("h3");
  title.textContent = "Jugadores en la sala";
  list = document.createElement("ul");
  list.id = "players_list";
  list.style.cssText =
    "list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;";
  container.appendChild(title);
  container.appendChild(list);
  return list;
}

function renderPlayers(players: GameStatePlayer[], list: HTMLUListElement) {
  list.innerHTML = "";
  for (const p of players) {
    const li = document.createElement("li");
    li.textContent = `${p.name}${p.isOwner ? " 👑" : ""}`;
    li.style.cssText =
      "padding:8px 12px;background:rgba(255,255,255,0.1);border-radius:8px;";
    list.appendChild(li);
  }
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
  clientRef?.close();
});

export {};
