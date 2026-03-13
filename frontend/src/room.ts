const room_code = document.getElementById("room_code") as HTMLTextAreaElement;
const start_game = document.getElementById("start_game") as HTMLButtonElement;

const STORAGE_KEYS = {
    name: "primero.name",
    code: "primero.code",
    state: "primero.roomState"
};

type RoomPlayer = {
    id: string;
    name: string;
    hand: Array<{ color: string; value: string }>;
    saidUno: boolean;
};

type RoomState = {
    code: string;
    players: RoomPlayer[];
    status: "waiting" | "playing" | "finished";
};

let currentRoomState: RoomState | null = null;
type ClientRef = {
    request: (type: string, payload: unknown) => Promise<unknown>;
    close: () => void;
};

let clientRef: ClientRef | null = null;

void initRoom();

async function initRoom() {
    const urlParams = new URLSearchParams(window.location.search);
    const createMode = urlParams.get("create") === "1";
    let roomCode = urlParams.get("code")?.toUpperCase() ?? sessionStorage.getItem(STORAGE_KEYS.code) ?? "";
    const name = sessionStorage.getItem(STORAGE_KEYS.name) ?? "";

    if (name.length < 1 || (!createMode && roomCode.length !== 6)) {
        window.location.href = "./../";
        return;
    }

    if (roomCode.length === 6) {
        room_code.innerText = roomCode;
        sessionStorage.setItem(STORAGE_KEYS.code, roomCode);
    }

    const playersList = ensurePlayersList();

    try {
        const { WsClient } = await import("./services/websocket.js");
        const wsClient = new WsClient();
        clientRef = wsClient;

        await wsClient.connect(getWsUrl());

        if (createMode) {
            const createResponse = await wsClient.request("room.create", { name });
            const createdCode = (createResponse.data as { code?: string } | undefined)?.code;
            if (createdCode === undefined) {
                throw new Error("El backend no devolvio un codigo de sala.");
            }

            roomCode = createdCode.toUpperCase();
            room_code.innerText = roomCode;
            sessionStorage.setItem(STORAGE_KEYS.code, roomCode);
            window.history.replaceState(null, "", `./index.html?code=${encodeURIComponent(roomCode)}`);
        }

        const onRoomState = (msg: { data?: unknown }) => {
            const state = msg.data as RoomState | undefined;
            if (state !== undefined) {
                updateRoomState(state, playersList);
            }
        };

        wsClient.on("room.state", onRoomState);
        wsClient.on("room state", onRoomState);

        wsClient.on("game.state", (msg) => {
            if (msg.data !== undefined) {
                sessionStorage.setItem(STORAGE_KEYS.state, JSON.stringify(msg.data));
            }
            window.location.href = `./../game/index.html?code=${encodeURIComponent(roomCode)}`;
        });

        const joinResponse = await joinWithReconnect(wsClient, name, roomCode);
        const joinedState = joinResponse.data as RoomState | undefined;
        if (joinedState !== undefined) {
            updateRoomState(joinedState, playersList);
        }
    }
    catch (error) {
        const wsError = error as { message?: string };
        alert(wsError.message ?? "No se pudo conectar a la sala.");
        window.location.href = "./../";
        return;
    }

    start_game.addEventListener("click", () => {
        void startGame(roomCode);
    });
}

async function joinWithReconnect(
    wsClient: {
        connect: (url: string) => Promise<void>;
        request: (type: string, payload: unknown) => Promise<{ data?: unknown }>;
    },
    name: string,
    roomCode: string
) {
    try {
        return await wsClient.request("room.join", { name, code: roomCode });
    }
    catch (error) {
        const wsError = error as { message?: string };
        if (wsError.message !== "Socket cerrado") throw error;

        await wsClient.connect(getWsUrl());
        return wsClient.request("room.join", { name, code: roomCode });
    }
}

async function startGame(roomCode: string) {
    if (clientRef === null) {
        alert("Conexion no disponible.");
        return;
    }

    try {
        await clientRef.request("game.start", { code: roomCode });
        window.location.href = `./../game/index.html?code=${encodeURIComponent(roomCode)}`;
    }
    catch (error) {
        const wsError = error as { message?: string };
        alert(wsError.message ?? "No se pudo iniciar la partida.");
    }
}

function updateRoomState(state: RoomState, playersList: HTMLUListElement) {
    currentRoomState = state;
    sessionStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state));
    renderPlayers(state.players, playersList);
    if (state.status === "playing") {
        window.location.href = `./../game/index.html?code=${encodeURIComponent(state.code)}`;
    }
}

function ensurePlayersList(): HTMLUListElement {
    const container = document.querySelector(".room_container") as HTMLElement;
    let list = document.getElementById("players_list") as HTMLUListElement | null;

    if (list !== null) return list;

    const title = document.createElement("h3");
    title.innerText = "Jugadores";
    list = document.createElement("ul");
    list.id = "players_list";
    container.appendChild(title);
    container.appendChild(list);
    return list;
}

function renderPlayers(players: RoomPlayer[], list: HTMLUListElement) {
    list.innerHTML = "";
    for (const player of players) {
        const item = document.createElement("li");
        item.innerText = `${player.name} (${player.hand.length} cartas)`;
        list.appendChild(item);
    }
}

function getWsUrl(): string {
    const configuredHost = localStorage.getItem("primero.wsHost");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = configuredHost && configuredHost.trim().length > 0
        ? configuredHost.trim()
        : window.location.host;
    return `${protocol}//${host}`;
}

window.addEventListener("beforeunload", () => {
    currentRoomState = null;
    clientRef?.close();
});

export {};