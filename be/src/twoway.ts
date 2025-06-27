import { WebSocket, WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });

const peers = new Map<string, WebSocket>();

server.on("connection", (ws: WebSocket) => {
  console.log("connection done");

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());
    const { type, name, sdp, candidate } = parsedData;

    if (type === "register") {
      console.log("register done", name);
      (ws as any).name = name;
      peers.set(name, ws);
    }

    if (["offer", "answer", "ice-candidate"].includes(type)) {
      const peer = peers.get(name);
      console.log("type ", type, "send to ");
      peer?.send(
        JSON.stringify({
          type,
          sdp,
          candidate,
        })
      );
    }
  });

  ws.on("close", () => {
    let leavingUser = (ws as any).name;
    peers.delete(leavingUser);
  });

  ws.on("error", (e) => console.log(e));
});
