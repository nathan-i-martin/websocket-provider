import WebSocket = require("ws");

export type OnConnectCallback = (connection: WebSocket) => void;