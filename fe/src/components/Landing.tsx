import { Link } from "react-router-dom";

export const Landing = () => {
  return (
    <div>
      <Link to={"/sender"}>sender</Link>
      <Link to={"/receiver"}>receiver</Link>
    </div>
  );
};
