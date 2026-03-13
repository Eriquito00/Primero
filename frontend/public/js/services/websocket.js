export class WsClient {
    ws = null;
    pending = new Map();
    listeners = new Map();
    seq = 0;
    connect(url) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }
        this.ws = new WebSocket(url);
        return new Promise((resolve, reject) => {
            if (this.ws === null) {
                reject(new Error("Socket no inicializado"));
                return;
            }
            this.ws.onopen = () => {
                resolve();
            };
            this.ws.onerror = () => {
                reject(new Error("Error al conectar WebSocket"));
            };
            this.ws.onmessage = (ev) => {
                let msg;
                try {
                    msg = JSON.parse(ev.data);
                }
                catch {
                    return;
                }
                if (msg.id !== undefined && this.pending.has(msg.id)) {
                    const p = this.pending.get(msg.id);
                    this.pending.delete(msg.id);
                    if (p !== undefined) {
                        if (msg.status === "success")
                            p.resolve(msg);
                        else
                            p.reject(msg);
                    }
                    return;
                }
                const type = msg.type ?? "";
                const set = this.listeners.get(type);
                if (set !== undefined) {
                    for (const cb of set)
                        cb(msg);
                }
            };
            this.ws.onclose = () => {
                for (const [, p] of this.pending) {
                    p.reject(new Error("Socket cerrado"));
                }
                this.pending.clear();
            };
        });
    }
    on(type, cb) {
        if (!this.listeners.has(type))
            this.listeners.set(type, new Set());
        this.listeners.get(type)?.add(cb);
        return () => this.listeners.get(type)?.delete(cb);
    }
    request(type, payload) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return Promise.reject(new Error("Socket no conectado"));
        }
        const id = `req_${Date.now()}_${this.seq++}`;
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.ws?.send(JSON.stringify({ id, type, payload }));
        });
    }
    close() {
        this.ws?.close();
    }
}
