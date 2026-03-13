import app from "./app";
import { createServer } from "http";
import { initializeWebSocket } from "./WebSocket";

const port = 3000;

const httpServer = createServer(app);

initializeWebSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
