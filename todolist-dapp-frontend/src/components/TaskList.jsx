import { useEffect, useState } from "react";
import todoAbi from "../abi/TodoContract.json";
import tokenAbi from "../abi/ToDoToken.json";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const TODO_CONTRACT_ADDRESS = "0x32cFf59d3614E3e162920272b1a9941BB2B0CE9e";

export default function TaskList({ wallet }) {
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState("");
  const [balance, setBalance] = useState("0");
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const init = async () => {
      const todo = new ethers.Contract(
        TODO_CONTRACT_ADDRESS,
        todoAbi.abi,
        wallet
      );
      setContract(todo);

      const addr = await wallet.getAddress();
      const admin = await todo.admins(addr);
      setIsAdmin(admin);

      const tokenAddr = await todo.token();
      const token = new ethers.Contract(tokenAddr, tokenAbi.abi, wallet);
      const rawBalance = await token.balanceOf(addr);
      setBalance(ethers.formatEther(rawBalance));
    };

    if (wallet) init();
  }, [wallet]);

  useEffect(() => {
    if (contract) {
      loadTasks();
      loadLeaderboard();
    }
  }, [contract]);

  const loadTasks = async () => {
    try {
      const taskCount = await contract.taskCounter();
      const taskList = [];

      for (let i = 1; i <= taskCount; i++) {
        const task = await contract.tasks(i);
        taskList.push({
          id: Number(task.id),
          description: task.description,
          isCompleted: task.isCompleted,
          isVerified: task.isVerified,
          completedBy: task.completedBy,
        });
      }

      setTasks(taskList);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const tokenAddr = await contract.token();
      const token = new ethers.Contract(tokenAddr, tokenAbi.abi, wallet);

      const users = await contract.getUsers();
      const data = [];

      for (let addr of users) {
        const rawBalance = await token.balanceOf(addr);
        const balance = Number(ethers.formatEther(rawBalance));
        data.push({ address: addr, balance });
      }

      data.sort((a, b) => b.balance - a.balance);
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  };

  const markTaskCompleted = async (taskId) => {
    try {
      const tx = await contract.markTaskCompleted(taskId);
      await tx.wait();
      toast.success("✅ Task marked as completed!");
      loadTasks();
    } catch (err) {
      toast.error("❌ Failed to mark task completed");
    }
  };

  const verifyTask = async (taskId) => {
    try {
      const tx = await contract.verifyTask(taskId);
      await tx.wait();
      toast.success("🎉 Task verified and reward given!");
      loadTasks();
      loadLeaderboard(); // 🏆 update leaderboard
    } catch (err) {
      toast.error("❌ Failed to verify task");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.createTask(newTaskDesc);
      await tx.wait();
      toast.success("📌 Task created!");
      setNewTaskDesc("");
      loadTasks();
    } catch (err) {
      toast.error("❌ Failed to create task");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.addAdmin(newAdmin);
      await tx.wait();
      toast.success("🎉 New admin added!");
      setNewAdmin("");
    } catch (err) {
      toast.error("❌ Failed to add admin");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>📋 Task List</h2>
      <p>💼 Role: {isAdmin ? "Admin" : "User"}</p>
      <p>💰 Your Token Balance: {balance} TODO</p>

      {isAdmin && (
        <>
          <form onSubmit={createTask} style={{ marginBottom: 10 }}>
            <input
              placeholder="Task description"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              required
            />
            <button type="submit">Create Task</button>
          </form>

          <form onSubmit={handleAddAdmin} style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="New admin address"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              required
            />
            <button type="submit">Add Admin</button>
          </form>
        </>
      )}

      <h3>📝 Available Tasks</h3>
      <ul>
        {tasks.length === 0 && <li>No tasks found.</li>}
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: "10px" }}>
            <strong>{task.description}</strong>
            <br />
            Status:{" "}
            {task.isVerified
              ? "✅ Verified"
              : task.isCompleted
              ? `⏳ Marked by: ${task.completedBy.slice(0, 6)}...`
              : "🕒 Pending"}

            {!isAdmin && !task.isCompleted && (
              <button
                onClick={() => markTaskCompleted(task.id)}
                style={{ marginLeft: 10 }}
              >
                Complete
              </button>
            )}

            {isAdmin && task.isCompleted && !task.isVerified && (
              <button
                onClick={() => verifyTask(task.id)}
                style={{ marginLeft: 10 }}
              >
                Verify
              </button>
            )}
          </li>
        ))}
      </ul>

      <h3>🏆 Leaderboard</h3>
      <ul>
        {leaderboard.length === 0 && <li>No data yet.</li>}
        {leaderboard.map((user, index) => (
          <li key={user.address}>
            #{index + 1} - {user.address.slice(0, 6)}...{user.address.slice(-4)}:{" "}
            {user.balance} TODO
          </li>
        ))}
      </ul>
    </div>
  );
}
