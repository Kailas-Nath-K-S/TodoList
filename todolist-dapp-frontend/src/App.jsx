// src/App.jsx
import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import TaskList from "./components/TaskList";
import Leaderboard from "./components/Leaderboard";
import "./App.css"
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);

  return (
    <div className="app-container">
      <ToastContainer />

      <h1>📝 TodoList DApp</h1>
      <ConnectWallet setWallet={setWallet} setProvider={setProvider} />
      {wallet && (
        <>
          <TaskList wallet={wallet} provider={provider} />
          <Leaderboard provider={provider} />
        </>
      )}
    </div>
  );
}
