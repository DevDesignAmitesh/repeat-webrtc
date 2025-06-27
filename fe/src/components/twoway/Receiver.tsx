import { useEffect, useRef, useState } from "react";

export const Receiver = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [name, setName] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    const pc = new RTCPeerConnection();
    setWs(ws);
    setPc(pc);

    ws.onmessage = async (event) => {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === "offer") {
        await pc.setRemoteDescription(parsedData.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        ws.send(
          JSON.stringify({
            type: "answer",
            sdp: pc.localDescription,
            name: localStorage.getItem("sender-name"),
          })
        );
      }

      if (parsedData.type === "ice-candidate") {
        await pc.addIceCandidate(parsedData.candidate);
      }

      if (parsedData.type === "answer") {
        await pc.setRemoteDescription(parsedData.sdp);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            name: localStorage.getItem("sender-name"),
          })
        );
      }
    };

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([event.track]);
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      ws.send(
        JSON.stringify({
          type: "offer",
          sdp: pc.localDescription,
          name: localStorage.getItem("sender-name"),
        })
      );
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

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = new MediaStream([videoTrack]);
      stream.getTracks().forEach((track) => {
        pc.addTrack(track);
      });
    }
  };

  const register = () => {
    if (!ws) {
      return;
    }
    ws.send(
      JSON.stringify({
        type: "register",
        name,
      })
    );
    localStorage.setItem("receiver-name", name);
    setIsRegister(false);
    setName("");
  };

  if (isRegister) {
    return (
      <div>
        <input
          type="text"
          placeholder="register with your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={register}>register</button>
      </div>
    );
  }
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
      <video
        ref={localVideoRef}
        muted
        autoPlay
        playsInline
        style={{ height: 300, width: 400 }}
      ></video>
      <button onClick={() => getVideoAndSend(pc)}>start sending video</button>
    </div>
  );
};
