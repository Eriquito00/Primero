import { addAtributes, addText, createElement } from "../libs/lib_element.js";

export let draggedCard: HTMLElement | null = null;

export class Card extends HTMLElement {
    private color: string;
    private value: string;

    public constructor(color: string, value: string) {
        super();
        this.color = color;
        this.value = value;
    }

    public createCard() {

        const card = createElement("div");
        addAtributes(card, {
            class: `card card_${this.color.toLowerCase()}`,
            draggable: "true"
        });

        card.addEventListener("dragstart", (e) => {
            draggedCard = card;
            e.dataTransfer!.setData("application/json", JSON.stringify(this.getCardData()));
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
    
    public getCardData() {
        return {
            "color": this.color,
            "value": this.value
        }
    }
}

customElements.define("primero-card", Card);