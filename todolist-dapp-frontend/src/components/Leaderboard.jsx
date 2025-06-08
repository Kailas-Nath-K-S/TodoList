// src/components/Leaderboard.jsx
import { useEffect, useState } from "react";
import todoAbi from "../abi/TodoContract.json";
import tokenAbi from "../abi/TodoToken.json";
import { ethers } from "ethers";

const TODO_CONTRACT_ADDRESS = "0x3FC698b08dB126376B9Ad72f7349Dd7db8a2CaE8";
const TOKEN_CONTRACT_ADDRESS = "0xBDfA765583e23f6a5c37CC1bc99F4423f8A4198b";

export default function Leaderboard({ provider }) {
  const [users, setUsers] = useState([]);
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const todo = new ethers.Contract(
        TODO_CONTRACT_ADDRESS,
        todoAbi.abi,
        provider
      );
      const token = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS,
        tokenAbi.abi,
        provider
      );

      try {
        const usersList = await todo.getUsers();
        const userBalances = await Promise.all(
          usersList.map(async (u) => {
            const balance = await token.balanceOf(u);
            return { address: u, balance: Number(ethers.formatEther(balance)) };
          })
        );

        userBalances.sort((a, b) => b.balance - a.balance);
        setBalances(userBalances);
      } catch (err) {
        console.error("Leaderboard error:", err);
      }
    };

    loadLeaderboard();
  }, [provider]);

  return (
    <div>
      <h2>🏆 Leaderboard</h2>
      <ol>
        {balances.map((user, idx) => (
          <li key={idx}>
            {user.address.slice(0, 6)}...{user.address.slice(-4)} - {user.balance} tokens
          </li>
        ))}
      </ol>
    </div>
  );
}
