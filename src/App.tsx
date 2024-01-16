import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Chat from "./components/Chat";
import Login from "./components/Login";
import { useAutoAnimate } from "@formkit/auto-animate/react";

function App() {
  const [animationParent] = useAutoAnimate({ duration: 200 });
  return (
    <>
      <ToastContainer />
      <h1 className="font-serif font-black text-7xl italic tracking-tight mb-4">
        SupaChat
      </h1>
      <Chat />
      <Login ref={animationParent} />
    </>
  );
}

export default App;
