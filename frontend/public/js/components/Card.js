import { addAtributes, addText, createElement } from "../libs/lib_element.js";
export class Card extends HTMLElement {
    createCard(color, number) {
        const card = createElement("div");
        addAtributes(card, {
            class: `card card_${color.toLowerCase()}`,
            draggable: "true"
        });
        const cornerTop = createElement("div");
        addAtributes(cornerTop, { class: "card_corner card_corner_top" });
        addText(cornerTop, number.toString());
        const center = createElement("div");
        addAtributes(center, { class: "card_center" });
        addText(center, number.toString());
        const cornerBottom = createElement("div");
        addAtributes(cornerBottom, { class: "card_corner card_corner_bottom" });
        addText(cornerBottom, number.toString());
        card.appendChild(cornerTop);
        card.appendChild(center);
        card.appendChild(cornerBottom);
        return card;
    }
}
customElements.define("primero-card", Card);
