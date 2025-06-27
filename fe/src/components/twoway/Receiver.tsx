import { useEffect, useRef, useState } from "react";

export const Receiver = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    const pc = new RTCPeerConnection();
    setWs(ws);
    setPc(pc);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "receiver" }));
    };

    ws.onmessage = async (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "offer") {
        await pc.setRemoteDescription(parsedData.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "answer", sdp: pc.localDescription }));
      }

      if (parsedData.type === "ice-candidate") {
        await pc.addIceCandidate(parsedData.candidate);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(
          JSON.stringify({ type: "ice-candidate", candidate: event.candidate })
        );
      }
    };

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([event.track]);
      }
    };
  }, []);

  return (
    <div>
      <p>video page</p>
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        style={{ height: 300, width: 400 }}
      ></video>
    </div>
  );
};
