const username = document.getElementById("username");
const code = document.getElementById("code");
const submit = document.getElementById("submit");
const create_room = document.getElementById("create_room");
create_room.addEventListener("click", () => { createRoom(username.value); });
submit.addEventListener("click", () => { enterRoom(username.value, code.value); });
const STORAGE_KEYS = {
    name: "primero.name",
    code: "primero.code"
};
function createRoom(username) {
    if (validateInfo(username)) {
        const name = username.trim();
        sessionStorage.setItem(STORAGE_KEYS.name, name);
        window.location.href = "./room/index.html?create=1";
    }
    else {
        alert("El username tiene que ser de 8 caracteres o mas y el codigo de 6 caracteres.");
    }
}
function enterRoom(username, code) {
    if (validateInfo(username, code)) {
        const name = username.trim();
        const roomCode = code.trim().toUpperCase();
        persistSession(name, roomCode);
        goToRoom(roomCode);
    }
    else {
        alert("El username tiene que ser de 8 caracteres o mas y el codigo de 6 caracteres.");
    }
}
function persistSession(name, roomCode) {
    sessionStorage.setItem(STORAGE_KEYS.name, name);
    sessionStorage.setItem(STORAGE_KEYS.code, roomCode);
}
function goToRoom(roomCode) {
    window.location.href = `./room/index.html?code=${encodeURIComponent(roomCode)}`;
}
function validateInfo(username, code) {
    if (code === undefined)
        return username.length >= 8;
    return username.length >= 8 && code.length === 6;
}
export {};
