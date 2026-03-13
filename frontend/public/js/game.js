import "./components/Card.js";
import { Card } from "./components/Card.js";
import { loadPlayers, showCardInThrowZone } from "./game.ui.js";
const board = document.getElementById("board");
const table = document.getElementById("users");
const dropZone = document.getElementById("table");
const deck = document.getElementById("deck");
const primero = document.getElementById("primero");
const STORAGE_KEYS = {
    name: "primero.name",
    code: "primero.code",
    state: "primero.roomState"
};
let wsClient = null;
let roomCode = "";
let playerName = "";
let myPlayerId = null;
let currentState = null;
void initGame();
async function initGame() {
    const urlParams = new URLSearchParams(window.location.search);
    roomCode = urlParams.get("code")?.toUpperCase() ?? sessionStorage.getItem(STORAGE_KEYS.code) ?? "";
    playerName = sessionStorage.getItem(STORAGE_KEYS.name) ?? "";
    if (roomCode.length !== 6 || playerName.length < 1) {
        window.location.href = "./../";
        return;
    }
    sessionStorage.setItem(STORAGE_KEYS.code, roomCode);
    const cachedState = sessionStorage.getItem(STORAGE_KEYS.state);
    if (cachedState !== null) {
        try {
            const parsed = JSON.parse(cachedState);
            renderGameState(parsed);
        }
        catch {
            // Ignorar cache corrupta.
        }
    }
    try {
        const { WsClient } = await import("./services/websocket.js");
        wsClient = new WsClient();
        await wsClient.connect(getWsUrl());
        wsClient.on("game.state", (msg) => {
            const state = msg.data;
            if (state !== undefined) {
                renderGameState(state);
            }
        });
        wsClient.on("game.over", (msg) => {
            const message = msg.message ?? "La partida ha terminado.";
            alert(message);
            window.location.href = "./../";
        });
        const joinRes = await wsClient.request("room.join", { name: playerName, code: roomCode });
        const joinedState = joinRes.data;
        if (joinedState !== undefined) {
            renderGameState(joinedState);
        }
    }
    catch (error) {
        const wsError = error;
        alert(wsError.message ?? "No se pudo conectar con la partida.");
        window.location.href = "./../";
        return;
    }
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
    deck.addEventListener("click", () => {
        void drawCard();
    });
    primero.addEventListener("click", () => {
        void sayUno();
    });
}
function renderGameState(state) {
    currentState = state;
    sessionStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state));
    if (state.code !== "") {
        sessionStorage.setItem(STORAGE_KEYS.code, state.code);
        roomCode = state.code;
    }
    const me = state.players.find((p) => p.name === playerName) ?? null;
    if (me !== null) {
        myPlayerId = me.id;
        renderHand(me.hand);
    }
    const playersCards = {};
    for (const player of state.players) {
        playersCards[player.name] = player.hand.length;
    }
    loadPlayers(playersCards, table);
    const topCard = state.pile[state.pile.length - 1];
    if (topCard !== undefined) {
        showCardInThrowZone(dropZone, topCard);
    }
}
function renderHand(hand) {
    board.innerHTML = "";
    hand.forEach((card, index) => {
        const element = new Card(card.color, getCardLabel(card.value)).createCard();
        element.dataset.cardIndex = index.toString();
        board.appendChild(element);
    });
}
async function playDraggedCard(event) {
    if (wsClient === null)
        return;
    const dragEvent = event;
    const source = dragEvent.dataTransfer?.getData("application/json");
    if (source === undefined || source === "")
        return;
    const payload = JSON.parse(source);
    const cardIndex = getCardIndexFromPayload(payload);
    if (cardIndex < 0) {
        alert("No se pudo identificar la carta a jugar.");
        return;
    }
    try {
        await wsClient.request("game.playCard", { cardIndex });
    }
    catch (error) {
        const wsError = error;
        alert(wsError.message ?? "No se pudo jugar la carta.");
    }
}
async function drawCard() {
    if (wsClient === null)
        return;
    try {
        await wsClient.request("game.drawCard", {});
    }
    catch (error) {
        const wsError = error;
        alert(wsError.message ?? "No se pudo robar carta.");
    }
}
async function sayUno() {
    if (wsClient === null)
        return;
    try {
        await wsClient.request("game.sayUno", {});
    }
    catch (error) {
        const wsError = error;
        alert(wsError.message ?? "No se pudo cantar UNO.");
    }
}
function getCardIndexFromPayload(payload) {
    if (currentState === null)
        return -1;
    const me = currentState.players.find((p) => p.id === myPlayerId || p.name === playerName);
    if (me === undefined)
        return -1;
    return me.hand.findIndex((card) => card.color === payload.color && getCardLabel(card.value) === payload.value);
}
function getCardLabel(value) {
    if (value === "skip")
        return "🛇";
    if (value === "reverse")
        return "⟲";
    if (value === "draw2")
        return "+2";
    return value;
}
function getWsUrl() {
    const configuredHost = localStorage.getItem("primero.wsHost");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = configuredHost && configuredHost.trim().length > 0
        ? configuredHost.trim()
        : window.location.host;
    return `${protocol}//${host}`;
}
window.addEventListener("beforeunload", () => {
    wsClient?.close();
});
