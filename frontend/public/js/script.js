"use strict";
const username = document.getElementById("username");
const code = document.getElementById("code");
const submit = document.getElementById("submit");
const create_room = document.getElementById("create_room");
create_room.addEventListener("click", () => { createRoom(username.value); });
submit.addEventListener("click", () => { enterRoom(username.value, code.value); });
function createRoom(username) {
    if (validateInfo(username)) {
        connectWS(username);
    }
    else {
        alert("El username tiene que ser de 8 caracteres o mas y el codigo de 6 caracteres.");
    }
}
function enterRoom(username, code) {
    if (validateInfo(username, code)) {
        connectWS(username, code);
    }
    else {
        alert("El username tiene que ser de 8 caracteres o mas y el codigo de 6 caracteres.");
    }
}
function connectWS(username, code) {
    /**
     * Abrir una conexion ws o wss.
     * Mandar el codigo y el username al backend
     * EL CODIGO ES VALIDO
     *      El backend se guarda el username y asocia ese usuario
     *      a la partida de ese codigo y se redirige a la sala en
     *      de espera.
     * EL CODIGO NO ES VALIDO
     *      Sale un alert conforme el codigo de esa sala no es valido
     */
    const codigo = code === undefined ? "AAAAAA" : code;
    window.location.href = `./room/index.html?code=${codigo}`;
}
function validateInfo(username, code) {
    if (code === undefined)
        return username.length >= 8;
    return username.length >= 8 && code.length === 6;
}
