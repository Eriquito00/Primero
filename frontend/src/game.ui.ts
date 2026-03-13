import "./components/Card.js";
import { Card } from "./components/Card.js";
import { addAtributes } from "./libs/lib_element.js";

/**
 * Carga el nombre de usuario y el número de cartas de los jugadores.
 * @param playersInfo  Record nombre → conteo de cartas
 * @param tableElement Elemento tabla
 * @param currentPlayerName Nombre del jugador cuyo turno es ahora (para resaltar)
 */
export function loadPlayers(
  playersInfo: Record<string, number>,
  tableElement: HTMLTableElement,
  currentPlayerName?: string,
) {
  while (tableElement.rows.length > 0) tableElement.deleteRow(0);
  createRows(playersInfo, tableElement, currentPlayerName);
}

export function createRows(
  playersInfo: Record<string, number>,
  tableElement: HTMLTableElement,
  currentPlayerName?: string,
) {
  for (const [name, count] of Object.entries(playersInfo)) {
    const tr = document.createElement("tr");
    if (name === currentPlayerName) {
      tr.classList.add("player_playing");
    }
    tr.innerHTML = `<td>${name}</td><td>${count}</td>`;
    tableElement.appendChild(tr);
  }
}

export function showCardInThrowZone(
  dropZone: HTMLElement,
  cardData: { color: string; value: string },
) {
  dropZone.textContent = "";
  const thrownCard = new Card(cardData.color, cardData.value).createCard();
  addAtributes(thrownCard, { draggable: "false" });
  dropZone.appendChild(thrownCard);
}
