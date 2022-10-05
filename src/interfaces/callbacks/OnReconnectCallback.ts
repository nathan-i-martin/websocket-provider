import WebSocket = require("ws");

export type OnReconnectCallback = (connection: WebSocket) => void;