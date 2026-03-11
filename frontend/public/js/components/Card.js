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
        card.addEventListener("mouseenter", (e) => { this.cardEnter(e); });
        card.addEventListener("dragenter", (e) => { this.cardEnter(e); });
        card.addEventListener("mouseleave", (e) => { this.cardLeave(e); });
        card.addEventListener("dragleave", (e) => { this.cardLeave(e); });
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
    cardEnter(e) {
        e.target.classList.add("card_drag");
    }
    cardLeave(e) {
        e.target.classList.remove("card_drag");
    }
    getCardData() {
        return {
            "color": this.color,
            "number": this.number
        };
    }
}
customElements.define("primero-card", Card);
