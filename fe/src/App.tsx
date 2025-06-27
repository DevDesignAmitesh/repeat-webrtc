import { Routes, Route } from "react-router-dom";
import { Landing } from "./components/oneway/Landing";
import { Sender } from "./components/oneway/Sender";
import { Receiver } from "./components/oneway/Receiver";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/sender" element={<Sender />} />
      <Route path="/receiver" element={<Receiver />} />
    </Routes>
  );
};

export default App;
