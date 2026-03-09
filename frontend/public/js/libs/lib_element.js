/**
 * Crea un elemento pasandole el nombre de la etiqueta
 * @param element Etiqueta que quieres crear
 * @returns Elemento HTML
 */
export function createElement(element) {
    return document.createElement(element);
}
/**
 * Añadir texto a un elemento
 * @param element Elemento HTML
 * @param text Texto que se añadira
 */
export function addText(element, text) {
    element.innerText = text;
}
/**
 * Añade atributos a un elemento HTML
 * @param element Elemento HTML
 * @param atributes Atributos a añadir como un 'class'
 */
export function addAtributes(element, atributes) {
    for (const [key, value] of Object.entries(atributes)) {
        element.setAttribute(key, value);
    }
}
/**
 * Añadir un elemento dentro de otro elemento
 * @param element Elemento a añadir
 * @param parent Elemento al que se añade
 */
export function addElement(element, parent) {
    parent.appendChild(element);
}
/**
 * Mueve un elemento ya existente como el primero del padre
 * @param element Elemento que se movera
 * @param parent Elemento padre
 */
export function firstofParent(element, parent) {
    parent.insertAdjacentElement("afterbegin", element);
}
/**
 * Mueve un elemento ya existente como el ultimo del padre
 * @param element Elemento que se movera
 * @param parent Elemento padre
 */
export function lastofParent(element, parent) {
    parent.insertAdjacentElement("beforeend", element);
}
/**
 * Mueve un elemento una posicion mas arriba
 * @param element Elemento que se movera
 */
export function moveForward(element) {
    const nextElement = element.previousElementSibling;
    nextElement.insertAdjacentElement("beforebegin", element);
}
/**
 * Mueve un elemento una posicion mas atras
 * @param element Elemento que se movera
 */
export function moveBack(element) {
    const previousElement = element.nextElementSibling;
    previousElement.insertAdjacentElement("afterend", element);
}
/**
 * Crea una tabla
 * @param files Filas de la tabla
 * @param columnes Columnas de la tabla
 * @param atributes Atributos para el elemento "table"
 * @param data Array de string bidimensional con los datos
 * @returns Elemento tabla con todo
 */
export function createTable(files, columnes, atributes, data) {
    if (files === 0 && columnes === 0 && data !== undefined) {
        files = data.length;
        columnes = data[0].length;
    }
    const table = createElement("table");
    if (atributes !== undefined)
        addAtributes(table, atributes);
    for (let i = 0; i < files; i++) {
        const tr = createElement("tr");
        for (let j = 0; j < columnes; j++) {
            const td = createElement("td");
            if (data !== undefined) {
                if (data[i][j] !== "") {
                    addText(td, data[i][j]);
                }
            }
            addElement(td, tr);
        }
        addElement(tr, table);
    }
    return table;
}
/**
 * Añade atributos a todos los hijos de un tipo específico dentro de un elemento padre
 * @param parent Elemento padre
 * @param tagName Nombre de la etiqueta de los hijos (por ejemplo, "tr")
 * @param atributes Atributos a añadir
 */
export function addAtributesToChilds(parent, tagName, atributes) {
    const childs = Array.from(parent.getElementsByTagName(tagName));
    childs.forEach((child) => {
        addAtributes(child, atributes);
    });
}
/**
 * Añade datos a una celda especifica
 * @param table Tabla
 * @param data Dato para la celda
 * @param fila Fila de la celda
 * @param columna Columna de la celda
 */
export function addDataToCell(table, data, fila, columna) {
    table.rows[fila].cells[columna].innerText = data;
}
/**
 * Mueve una columna una posición hacia la izquierda
 * @param table Tabla HTML
 * @param colIndex Índice de la columna a mover
 */
export function moveColumnLeft(table, colIndex) {
    if (colIndex <= 0)
        return;
    for (const row of Array.from(table.rows)) {
        const cells = row.cells;
        if (cells.length > colIndex) {
            row.insertBefore(cells[colIndex], cells[colIndex - 1]);
        }
    }
}
/**
 * Mueve una columna una posición hacia la derecha
 * @param table Tabla HTML
 * @param colIndex Índice de la columna a mover
 */
export function moveColumnRight(table, colIndex) {
    const rowLength = table.rows[0]?.cells.length ?? 0;
    if (colIndex < 0 || colIndex >= rowLength - 1)
        return;
    for (const row of Array.from(table.rows)) {
        const cells = row.cells;
        if (cells.length > colIndex + 1) {
            row.insertBefore(cells[colIndex + 1], cells[colIndex]);
        }
    }
}
/**
 * Mueve una columna a la primera posición
 * @param table Tabla HTML
 * @param colIndex Índice de la columna a mover
 */
export function moveColumnFirst(table, colIndex) {
    if (colIndex <= 0)
        return;
    for (const row of Array.from(table.rows)) {
        const cells = row.cells;
        if (cells.length > colIndex) {
            row.insertBefore(cells[colIndex], cells[0]);
        }
    }
}
/**
 * Mueve una columna a la última posición
 * @param table Tabla HTML
 * @param colIndex Índice de la columna a mover
 */
export function moveColumnLast(table, colIndex) {
    const rowLength = table.rows[0]?.cells.length ?? 0;
    if (colIndex < 0 || colIndex >= rowLength - 1)
        return;
    for (const row of Array.from(table.rows)) {
        const cells = row.cells;
        if (cells.length > colIndex) {
            row.appendChild(cells[colIndex]);
        }
    }
}
/**
 * Añade una fila en una posición determinada
 * @param table Tabla HTML
 * @param index Índice donde se añadirá la fila
 * @param data Datos opcionales para la fila
 */
export function addRowAt(table, index, data) {
    const row = table.insertRow(index);
    const columns = table.rows[0]?.cells.length ?? (data ? data.length : 0);
    for (let i = 0; i < columns; i++) {
        const cell = row.insertCell(i);
        if (data && data[i] !== undefined) {
            cell.innerText = data[i];
        }
    }
}
/**
 * Añade una columna en una posición determinada
 * @param table Tabla HTML
 * @param index Índice donde se añadirá la columna
 * @param data Datos opcionales para la columna
 */
export function addColumnAt(table, index, data) {
    for (let i = 0; i < table.rows.length; i++) {
        const cell = table.rows[i].insertCell(index);
        if (data && data[i] !== undefined) {
            cell.innerText = data[i];
        }
    }
}
/**
 * Elimina una fila en una posición determinada
 * @param table Tabla HTML
 * @param index Índice de la fila a eliminar
 */
export function deleteRowAt(table, index) {
    if (index >= 0 && index < table.rows.length) {
        table.deleteRow(index);
    }
}
/**
 * Elimina una columna en una posición determinada
 * @param table Tabla HTML
 * @param index Índice de la columna a eliminar
 */
export function deleteColumnAt(table, index) {
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        if (row.cells.length > index) {
            row.deleteCell(index);
        }
    }
}
