import { WebSocket, WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });

type User = { name: string; ws: WebSocket };

const allClients = new Map<string, WebSocket>();
const streamerWithViewer = new Map<string, Array<User>>();

server.on("connection", (ws: WebSocket) => {
  console.log("connetion done");

  ws.on("message", (data) => {
    const parsedData = JSON.parse(data.toString());

    const { type, sdp, candidate, name, target } = parsedData;

    if (type === "register") {
      allClients.set(name, ws);
    }

    if (type === "start-vewing") {
      if (!streamerWithViewer.has(target)) {
        streamerWithViewer.set(target, []);
      }
      streamerWithViewer.get(target)?.push(name);
      const user = allClients.get(target);

      if (!user) {
        return;
      }

      user.send(
        JSON.stringify({
          type: "viewer joined",
          viewer: name,
        })
      );
    }

    if (["offer", "answer", "ice-candidate"].includes(type)) {
      const user = allClients.get(target);
      if (!user) {
        return;
      }
      user.send(
        JSON.stringify({
          type,
          sdp,
          candidate,
          from: name,
        })
      );
    }
  });

  ws.on("close", () => {
    const leavingUser = (ws as any).name;
    allClients.delete(leavingUser);

    for (const [streamer, viewers] of streamerWithViewer.entries()) {
      if (leavingUser === streamer) {
        streamerWithViewer.delete(leavingUser);
      } else {
        const filteredUsers = viewers.filter((v) => v.name !== leavingUser);
        streamerWithViewer.set(streamer, filteredUsers);
      }
    }
  });

  ws.on("error", (e) => console.log(e));
});
