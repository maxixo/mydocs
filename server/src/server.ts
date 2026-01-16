import http from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initWebSocketServer } from "./websocket/index.js";
import { logger } from "./utils/logger.js";

const app = createApp();
const server = http.createServer(app);

initWebSocketServer(server);

server.listen(env.port, () => {
  logger.info(`Server listening on port ${env.port}`);
});
