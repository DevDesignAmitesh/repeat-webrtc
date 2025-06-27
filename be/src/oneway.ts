import { WebSocket, WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });

let recevier: WebSocket | null = null;
let sender: WebSocket | null = null;

server.on("connection", (ws: WebSocket) => {
  console.log("connection done");

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());

    if (parsedData.type === "sender") {
      sender = ws;
    }

    if (parsedData.type === "receiver") {
      recevier = ws;
    }

    if (parsedData.type === "offer") {
      if (ws !== sender) {
        return;
      }
      recevier?.send(
        JSON.stringify({ type: parsedData.type, sdp: parsedData.sdp })
      );
    }

    if (parsedData.type === "answer") {
      if (ws !== recevier) {
        return;
      }
      sender?.send(
        JSON.stringify({ type: parsedData.type, sdp: parsedData.sdp })
      );
    }

    if (parsedData.type === "ice-candidate") {
      if (ws === recevier) {
        sender?.send(
          JSON.stringify({ type: parsedData.type, sdp: parsedData.sdp })
        );
      }
      if (ws === sender) {
        recevier?.send(
          JSON.stringify({ type: parsedData.type, sdp: parsedData.sdp })
        );
      }
    }
  });

  ws.on("error", (e) => console.log(e));
});
