import { Routes, Route } from "react-router-dom";
import { Landing } from "./components/Landing";
import { Sender } from "./components/twoway/Sender";
import { Receiver } from "./components/twoway/Receiver";

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
