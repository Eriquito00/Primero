"use strict";
const room_code = document.getElementById("room_code");
const start_game = document.getElementById("start_game");
const urlParams = new URLSearchParams(window.location.search);
const codigo = urlParams.get("code");
if (codigo === null)
    window.location.href = "./../";
else
    room_code.innerText = codigo;
start_game.addEventListener("click", () => { startGame(); });
function startGame() {
    /**
     * Aqui lo ideal serian 2 cosas:
     *      1. Que todos puedan darle pero que solo si el admin le da
     *      empieza y al resto le salga alert.
     *      2. Que el boton de empezar este deshabilitado y solo cuando el admin
     *      se mete a esta pagina le salga que puede darle.
     * Y una vez darle al boton que te lleve a lo que seria el apartado del juego.
     */
    window.location.href = "./../game/";
}
