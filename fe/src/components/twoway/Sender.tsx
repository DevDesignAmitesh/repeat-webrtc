import { useEffect, useRef, useState } from "react";

export const Sender = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    const pc = new RTCPeerConnection();
    setPc(pc);
    setWs(ws);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };

    ws.onmessage = async (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "answer") {
        await pc.setRemoteDescription(parsedData.sdp);
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

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      ws.send(JSON.stringify({ type: "offer", sdp: pc.localDescription }));
    };
  }, []);

  const getVideoAndSend = async (pc: RTCPeerConnection | null) => {
    if (!pc) {
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const videoTrack = stream.getVideoTracks()[0];

    if (videoRef.current) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
      stream.getTracks().forEach((track) => {
        pc.addTrack(track);
      });
    }
  };

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
      <button onClick={() => getVideoAndSend(pc)}>start sender video</button>
    </div>
  );
};
