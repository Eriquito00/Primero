export type ServerMsg = {
    status: "success" | "fail" | "error";
    type?: string;
    id?: string;
    data?: unknown;
    message?: string;
};

type Pending = {
    resolve: (value: ServerMsg) => void;
    reject: (reason?: unknown) => void;
};

export class WsClient {
    private ws: WebSocket | null = null;
    private pending = new Map<string, Pending>();
    private listeners = new Map<string, Set<(msg: ServerMsg) => void>>();
    private seq = 0;

    connect(url: string): Promise<void> {
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
                let msg: ServerMsg;

                try {
                    msg = JSON.parse(ev.data as string) as ServerMsg;
                }
                catch {
                    return;
                }

                if (msg.id !== undefined && this.pending.has(msg.id)) {
                    const p = this.pending.get(msg.id);
                    this.pending.delete(msg.id);
                    if (p !== undefined) {
                        if (msg.status === "success") p.resolve(msg);
                        else p.reject(msg);
                    }
                    return;
                }

                const type = msg.type ?? "";
                const set = this.listeners.get(type);
                if (set !== undefined) {
                    for (const cb of set) cb(msg);
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

    on(type: string, cb: (msg: ServerMsg) => void) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set());
        this.listeners.get(type)?.add(cb);
        return () => this.listeners.get(type)?.delete(cb);
    }

    request(type: string, payload: unknown): Promise<ServerMsg> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            return Promise.reject(new Error("Socket no conectado"));
        }

        const id = `req_${Date.now()}_${this.seq++}`;

        return new Promise<ServerMsg>((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.ws?.send(JSON.stringify({ id, type, payload }));
        });
    }

    close() {
        this.ws?.close();
    }
}
