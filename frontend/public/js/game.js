import "./components/Card.js";
import { Card } from "./components/Card.js";
import { addCard, throwCard } from "./game.logic.js";
// Este import es por que aun no comunica con backend y hay que cargar manualmente la primera vez la tabla
import { loadPlayers } from "./game.ui.js";
const board = document.getElementById("board");
const table = document.getElementById("users");
const dropZone = document.getElementById("table");
const deck = document.getElementById("deck");
const primero = document.getElementById("primero");
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${protocol}//${window.location.host}`);
//Esta array de cartas es mientras el servidor no reparta las cartas a los jugadores
export const cards = [
    new Card("red", 1).createCard(),
    new Card("blue", 2).createCard(),
    new Card("green", 3).createCard(),
    new Card("yellow", 4).createCard(),
    new Card("red", 5).createCard(),
    new Card("blue", 6).createCard(),
    new Card("green", 7).createCard(),
];
cards.forEach(e => { board.appendChild(e); });
// Este diccionario esta mientras el servidor no traiga los nombres y el numero de cartas de los jugadores
export const user_cards = {
    "iker": 9,
    "eric": 5,
    "david Cat": 9,
    "david Mar": 5,
    "miguelon": 43,
    "computero": 80,
    "irene": 10,
    "anghelo": 6,
    "jan": 14
};
loadPlayers(user_cards, table);
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drop_over");
});
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drop_over");
});
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    throwCard(e, dropZone, table);
});
deck.addEventListener("click", () => { addCard(table, board); });
primero.addEventListener("click", () => {
    /**
     * Mirar el jugador que le ha dado al boton
     * Mirar si tiene 1 carta despues de la jugada
     *  - TIENE 1: No pasa nada
     *  - TIENE MAS: Se le castiga dandole X cartas
     */
});
/**
 * Aqui falta gestionar aun:
 *  - Cuando se acaba de entrar se tienen que cargar los jugadores por ws o wss
 *  - Cuando se lleva una carta a la zona de lanzar
 *  - Cuando se pide otra carta
 *  - Cuando se le da al boton de primero:
 *      - Si tiene 2 cartas y deja una no pasa nada
 *      - Si tiene 2 cartas o mas despues de la jugada que se le penalice
 *  - Cuando algun jugador lance alguna carta actualizar la tabla de jugadores
 *  - Cuando algun jugador ya no tenga cartas el juego acaba con un alert
 *    o lo que sea y se envia al inicio
 */ 
