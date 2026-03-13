import "./components/Card.js";
import { Card, draggedCard } from "./components/Card.js";
import { loadPlayers, showCardInThrowZone } from "./game.ui.js";

// Este import es por el diccionario y las cartas provisional
import { user_cards } from "./game.js";

/**
 * Pasar las comprovaciones de una jugada de un jugador
 * @param cardData Datos de la carta, color y numero
 * @returns True si es valida False si no es valida
 */
export function validatePlay(cardData: { color: string, number: number }): boolean {
    /**
     * Aqui para probar y tener aqui una funcioncilla que permita o no cartas tenia esto
     * pero era para probar.
     * 
     * Lo que tiene que haber aqui es una peticion con ws o wss pasandole la info de la carta
     * y comprovando si coincide el color o numero con la carta anterior.
     *  - Coincide: Perfecto se devuelve true
     *  - No coincide: Pues se devolvera false
     */
    if (cardData.color === "red") return false;
    if (cardData.number < 4) return false;
    return true;
}

export function throwCard(e: Event, dropZone: HTMLElement, table: HTMLTableElement) {
    dropZone.classList.remove("drop_over");
    const data = JSON.parse((e as DragEvent).dataTransfer!.getData("application/json")) as { color: string, number: number };

    // Comprovar si es el turno del usuario
    if (validatePlay(data)) {
        // Se le borra la carta de la baraja
        draggedCard?.remove();

        // Se pone en el apartado de throw a card la carta lanzada
        showCardInThrowZone(dropZone, data);

        /**
         * Se comprueba si tiene 1 carta o mas
         * Si tiene 1 carta y no le ha dado al boton se le dan X cartas
         */

        // Se llama a una funcion para actualizar la tabla de cartas de los jugadores
        loadPlayers(user_cards, table);

        // Se pasa el turno al siguiente jugador


        // SE TRENDRA QUE BORRAR: Console log para comprovar los datos de la carta
        console.log("Carta jugada:", data);
    }
    else {
        alert("Jugada invalida");
    }
}

export function addCard(table: HTMLTableElement, board: HTMLElement) {
    /**
     * SOLO SI ES EL TURNO DEL USUARIO
     * 
     * Aqui se hara una peticion al backend con ws o wss para pedir una carta
     * que este disponible en el diccionario, lo que necesito aqui en el frontend
     * es un json con la info del color y el numero, con eso se lo pasas a la clase
     * de Card y ya te crea la carta luego la añades a board y ya le aparece al
     * usuario.
     */

    // Se llama a una funcion para actualizar la tabla de cartas de los jugadores
    loadPlayers(user_cards, table);

    const COLORS = ["red", "blue", "green", "yellow"] as const;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const number = Math.floor(Math.random() * 10);
    board.appendChild(new Card(color, number).createCard());
}