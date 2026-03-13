import { addAtributes, addText, createElement } from "../libs/lib_element.js";
export let draggedCard = null;
export class Card extends HTMLElement {
    color;
    value;
    constructor(color, value) {
        super();
        this.color = color;
        this.value = value;
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
        addText(cornerTop, this.value);
        const center = createElement("div");
        addAtributes(center, { class: "card_center" });
        addText(center, this.value);
        const cornerBottom = createElement("div");
        addAtributes(cornerBottom, { class: "card_corner card_corner_bottom" });
        addText(cornerBottom, this.value);
        card.appendChild(cornerTop);
        card.appendChild(center);
        card.appendChild(cornerBottom);
        return card;
    }
    getCardData() {
        return {
            "color": this.color,
            "value": this.value
        };
    }
}
customElements.define("primero-card", Card);
