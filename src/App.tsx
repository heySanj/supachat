import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Chat from "./components/Chat";
import Login from "./components/Login";
import styled from "styled-components";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const MainWrapper = styled.div``;

function App() {
  const [animationParent] = useAutoAnimate();
  return (
    <MainWrapper
      ref={animationParent}
      className="overflow-hidden h-screen p-2 flex flex-col justify-between "
    >
      <h1 className="font-serif font-black text-5xl italic tracking-tight pb-4 ">
        SupaChat
      </h1>
      <ToastContainer />
      <Chat className="flex flex-col  h-0 flex-grow" />
      <Login className="" />
    </MainWrapper>
  );
}

export default App;
