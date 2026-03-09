import "./components/Card.js";
import { Card } from "./components/Card.js";

const board = document.getElementById("board") as HTMLElement;
const table = document.getElementById("users") as HTMLTableElement;

const cards = [
    new Card().createCard("red", 1),
    new Card().createCard("blue", 2),
    new Card().createCard("green", 3),
    new Card().createCard("yellow", 4),
];

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${protocol}//${window.location.host}`);

const user_cards: Record<string, number> = {
    "iker": 9,
    "eric": 5,
    "david Cat": 9,
    "david Mar": 5,
    "miguelon": 43,
    "computero": 80,
    "irene": 10,
    "anghelo": 6,
    "jan": 14
}

cards.forEach(e => { board.appendChild(e); });

for (const user in user_cards) {
    table.innerHTML += 
        `<tr>
            <td>${user}</td>
            <td>${user_cards[user]}</td>
        </tr>`;
}