// src/components/Leaderboard.jsx
import { useEffect, useState } from "react";
import todoAbi from "../abi/TodoContract.json";
import tokenAbi from "../abi/ToDoToken.json";
import { ethers } from "ethers";

const TODO_CONTRACT_ADDRESS = "0x32cFf59d3614E3e162920272b1a9941BB2B0CE9e";
const TOKEN_CONTRACT_ADDRESS = "0x86e7d622960e9a1E934fC33B36a65298C4552dCa";

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
            {user.address} - {user.balance} tokens
          </li>
        ))}
      </ol>
    </div>
  );
}
