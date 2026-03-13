const username = document.getElementById("username") as HTMLInputElement;
const code = document.getElementById("code") as HTMLInputElement;
const submit = document.getElementById("submit") as HTMLButtonElement;
const create_room = document.getElementById("create_room") as HTMLButtonElement;

create_room.addEventListener("click", () => { createRoom(username.value); });
submit.addEventListener("click", () => { enterRoom(username.value, code.value); });

const STORAGE_KEYS = {
    name: "primero.name",
    code: "primero.code"
};

function createRoom(username: string) {
    if (validateInfo(username)) {
        const name = username.trim();
        sessionStorage.setItem(STORAGE_KEYS.name, name);
        window.location.href = "./room/index.html?create=1";
    }
    else {
        alert("El username tiene que ser de 8 caracteres o mas y el codigo de 6 caracteres.")
    }
}

function enterRoom(username: string, code: string) {
    if (validateInfo(username, code)) {
        const name = username.trim();
        const roomCode = code.trim().toUpperCase();
        persistSession(name, roomCode);
        goToRoom(roomCode);
    }
    else {
        alert("El username tiene que ser de 8 caracteres o mas y el codigo de 6 caracteres.")
    }
}

function persistSession(name: string, roomCode: string) {
    sessionStorage.setItem(STORAGE_KEYS.name, name);
    sessionStorage.setItem(STORAGE_KEYS.code, roomCode);
}

function goToRoom(roomCode: string) {
    window.location.href = `./room/index.html?code=${encodeURIComponent(roomCode)}`;
}

function validateInfo(username: string, code?: string): boolean {
    if (code === undefined) return username.length >= 8;
    return username.length >= 8 && code.length === 6;
}

export {};