import { addAtributes, addText, createElement } from "../libs/lib_element.js";

export class Card extends HTMLElement {
    constructor() {
        super();
    }

    public createCard(color: string, number: number) {
        const div = createElement("div");
        addAtributes(div, { class: `card card_${color.toLowerCase()}` });
        addText(div, number.toString());
        return div;
    }
}

customElements.define("primero-card", Card);