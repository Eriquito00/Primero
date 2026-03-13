import app from "./app";
import { createServer } from "http";
import { initializeWebSocket } from "./WebSocket";

const port = Number(process.env.PORT ?? 3000);

const httpServer = createServer(app);

initializeWebSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
