import { WebSocket, WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });

let recevier: WebSocket | null = null;
let sender: WebSocket | null = null;

server.on("connection", (ws: WebSocket) => {
  console.log("connection done");

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());
    console.log(parsedData);

    if (parsedData.type === "sender") {
      console.log("sender set");
      sender = ws;
    }

    if (parsedData.type === "receiver") {
      console.log("recevier set");
      recevier = ws;
    }

    if (parsedData.type === "offer") {
      console.log("offer sent");
      if (ws !== sender) {
        return;
      }
      recevier?.send(
        JSON.stringify({ type: parsedData.type, sdp: parsedData.sdp })
      );
    }

    if (parsedData.type === "answer") {
      console.log("answer sent");
      if (ws !== recevier) {
        return;
      }
      sender?.send(
        JSON.stringify({ type: parsedData.type, sdp: parsedData.sdp })
      );
    }

    if (parsedData.type === "ice-candidate") {
      console.log("ice candidtae sent");
      if (ws === recevier) {
        sender?.send(
          JSON.stringify({
            type: parsedData.type,
            candidate: parsedData.candidate,
          })
        );
      }
      if (ws === sender) {
        recevier?.send(
          JSON.stringify({
            type: parsedData.type,
            candidate: parsedData.candidate,
          })
        );
      }
    }
  });

  ws.on("close", () => {
    recevier = null;
    sender = null;
  });

  ws.on("error", (e) => console.log(e));
});
