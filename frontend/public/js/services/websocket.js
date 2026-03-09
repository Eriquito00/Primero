export class WebSocketService {
    socket;
    constructor(url) {
        this.socket = new WebSocket(url);
        this.socket.onopen = () => {
            console.log("WebSocket conectado");
        };
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Mensaje recibido:", data);
        };
        this.socket.onclose = () => {
            console.log("WebSocket cerrado");
        };
        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }
    send(data) {
        this.socket.send(JSON.stringify(data));
    }
}
