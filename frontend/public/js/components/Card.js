import { addAtributes, addText, createElement } from "../libs/lib_element.js";
export let draggedCard = null;
export class Card extends HTMLElement {
    color;
    number;
    constructor(color, number) {
        super();
        this.color = color;
        this.number = number;
    }
    createCard() {
        const card = createElement("div");
        addAtributes(card, {
            class: `card card_${this.color.toLowerCase()}`,
            draggable: "true"
        });
        card.addEventListener("dragstart", (e) => {
            draggedCard = card;
            e.dataTransfer.setData("application/json", JSON.stringify(this.getCardData()));
        });
        card.addEventListener("dragend", () => {
            draggedCard = null;
        });
        const cornerTop = createElement("div");
        addAtributes(cornerTop, { class: "card_corner card_corner_top" });
        addText(cornerTop, this.number.toString());
        const center = createElement("div");
        addAtributes(center, { class: "card_center" });
        addText(center, this.number.toString());
        const cornerBottom = createElement("div");
        addAtributes(cornerBottom, { class: "card_corner card_corner_bottom" });
        addText(cornerBottom, this.number.toString());
        card.appendChild(cornerTop);
        card.appendChild(center);
        card.appendChild(cornerBottom);
        return card;
    }
    getCardData() {
        return {
            "color": this.color,
            "number": this.number
        };
    }
}
customElements.define("primero-card", Card);
