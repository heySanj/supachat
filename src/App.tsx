import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import Chat from "./components/Chat";
import Login from "./components/Login";

function App() {
  return (
    <>
      <ToastContainer />
      <h1 className="font-serif font-black text-7xl italic tracking-tight mb-4">
        SupaChat
      </h1>
      <Chat />
      <Login />
    </>
  );
}

export default App;
