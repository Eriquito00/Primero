import "./components/Card.js";
import { Card } from "./components/Card.js";
import { addAtributes } from "./libs/lib_element.js";

/**
 * Carga el nombre de usuario y el numero de cartas de los jugadores
 * @param playersInfo Record con el nombre y cartas del jugador
 * @param tableElement Elemento Tabla
 */
export function loadPlayers(playersInfo: Record<string, number>, tableElement: HTMLTableElement) {
    while (tableElement.rows.length > 0) tableElement.deleteRow(0);
    createRows(playersInfo, tableElement);
}

export function createRows(playersInfo: Record<string, number>, tableElement: HTMLTableElement) {
    for (const user in playersInfo) {
        let tr = "<tr>";
        // ESTILO DE PRUEBA, este estilo lo tendra el jugador que sea su turno
        if (user === "irene" || user === "eric") tr = `<tr class="player_playing">`;
        tableElement.innerHTML +=
            `${tr}
                <td>${user}</td>
                <td>${playersInfo[user]}</td>
            </tr>`;
    }
}

export function showCardInThrowZone(dropZone: HTMLElement, cardData: { color: string, number: number }) {
    dropZone.textContent = "";
    const thrownCard = new Card(cardData.color, cardData.number).createCard();
    addAtributes(thrownCard, { "draggable": "false" });
    dropZone.appendChild(thrownCard);
}