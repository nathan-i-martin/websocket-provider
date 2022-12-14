# Websocket Provider
This code is intended to be a basic abstraction of the base websocket API which you can then build your websocket around.
This code is written with the intent that it be taken and changed as needed to fit the needs of your individual projects. Hence why it does not have an `npm` repository set up.


# WebSocket Server

Creating a new WebSocket server instance is as easy as calling `new WebsocketProvider(port)` you can then set parameters and event listeners.
```javascript
const init = async (): void => {
    const socket: WebsocketProvider = new WebsocketProvider(8080);

    socket.on("message",(message: string) => {
        console.log(message);
    });

    if(!(await socket.connect())) return console.error('Unable to start the connection!');

    socket.send('hello world');
}
init();
```
---
## Event Listeners
There are four events that you can listen for; `connect`, `message`, `close`, and `error`.
> **NOTE:** Event listeners must be defined before you start the WebSocket connection

### `connect`
```javascript
socket.on('connect',(connection: WebSocket) => {
    
});
```
### `message`
```javascript
socket.on('message',(message: string) => {
    
});
```
### `close`
```javascript
socket.on('close',() => {
    
});
```
### `error`
```javascript
socket.on('error',() => {
    
});
```
---
## Methods
### `.on()`
Listen for an event to fire.
### `.connect()`
Open the WebSocket connection.
### `.send()`
Send a message over the connection.
- *param* `message` - The message to be sent.
- *throws* - An error if you try to send a message when the connection is closed.
### `.ping()`
Ping the connection.
- *throws* - An error if you try to ping the connection while it's closed.
### `.close()`
Close the connection.


# WebSocket Subscriber

Creating a subscriber is as easy as making a provider.
```javascript
const init = async (): void => {
    const uri = new URIBuilder()
                    .setProtocol(StandardProtocol.WS)
                    .setHostname("localhost")
                    .setPort(8080)
                    .build();

    const socket = new WebsocketSubscriber(uri);
    socket.reconnect(2);

    socket.on("message",(message: string) => {
        console.log(message);
    });
    
    if(!(await socket.connect())) throw new Error('Unable to start the connection!');
}
init();
```
---
## Event Listeners
There are five events that you can listen for; `connect`, `message`, `close`, `error`, and `close`.
> **NOTE:** Event listeners must be defined before you start the WebSocket connection

### `connect`
```javascript
socket.on('connect',(connection: WebSocket) => {
    
});
```
### `message`
```javascript
socket.on('message',(message: string) => {
    
});
```
### `close`
```javascript
socket.on('close',() => {
    
});
```
### `error`
```javascript
socket.on('error',() => {
    
});
```
### `reconnect`
```javascript
socket.on('reconnect',() => {
    
});
```
---
## Methods
### `.on()`
Listen for an event to fire.
### `.connect()`
Open the WebSocket connection.
### `.send()`
Send a message over the connection.
- *param* `message` - The message to be sent.
- *throws* - An error if you try to send a message when the connection is closed.
### `.ping()`
Ping the connection.
- *throws* - An error if you try to ping the connection while it's closed.
### `.close()`
Close the connection.
### `.kill()`
Kill the connection. The only difference between this and `.close()` is that this will not allow the connection to be restarted; even if `.reconnect()` has been set.
### `.reconnect()`
Set this Websocket to attempt to reconnect after a delay (in seconds). Default's to disabled
- *param* `delay` - Default `null` - The amount of time to wait (in seconds) before attempting to reconnect. If set to `null`, the connection will not attempt to reconnect on close.
