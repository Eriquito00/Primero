import "./components/Card.js";
import { Card, draggedCard } from "./components/Card.js";
const board = document.getElementById("board");
const table = document.getElementById("users");
const dropZone = document.getElementById("table");
const deck = document.getElementById("deck");
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${protocol}//${window.location.host}`);
//Esta array de cartas es mientras el servidor no reparta las cartas a los jugadores
const cards = [
    new Card("red", 1).createCard(),
    new Card("blue", 2).createCard(),
    new Card("green", 3).createCard(),
    new Card("yellow", 4).createCard(),
    new Card("red", 5).createCard(),
    new Card("blue", 6).createCard(),
    new Card("green", 7).createCard(),
    new Card("yellow", 8).createCard(),
    new Card("red", 9).createCard(),
    new Card("blue", 0).createCard(),
    new Card("green", 3).createCard(),
    new Card("yellow", 6).createCard(),
];
cards.forEach(e => { board.appendChild(e); });
// Este diccionario esta mientras el servidor no traiga los nombres y el numero de cartas de los jugadores
const user_cards = {
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
/**
 * Carga el nombre de usuario y el numero de cartas de los jugadores
 * @param playersInfo Record con el nombre y cartas del jugador
 * @param tableElement Elemento Tabla
 */
function loadPlayers(playersInfo, tableElement) {
    for (const user in playersInfo) {
        tableElement.innerHTML +=
            `<tr>
                <td>${user}</td>
                <td>${user_cards[user]}</td>
            </tr>`;
    }
}
loadPlayers(user_cards, table);
/**
 * Pasar las comprovaciones de una jugada de un jugador
 * @param cardData Datos de la carta, color y numero
 * @returns True si es valida False si no es valida
 */
function validatePlay(cardData) {
    if (cardData.color === "green" || cardData.color === "red")
        return false;
    if (cardData.number <= 5)
        return false;
    return true;
}
function addCardPlayer() {
    const COLORS = ["red", "blue", "green", "yellow"];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const number = Math.floor(Math.random() * 10);
    board.appendChild(new Card(color, number).createCard());
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
    const data = JSON.parse(e.dataTransfer.getData("application/json"));
    if (validatePlay(data)) {
        draggedCard?.remove();
        console.log("Carta jugada:", data);
    }
});
deck.addEventListener("click", () => { addCardPlayer(); });
