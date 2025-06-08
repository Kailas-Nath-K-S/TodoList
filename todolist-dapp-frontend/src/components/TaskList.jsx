import { useEffect, useState } from "react";
import todoAbi from "../abi/TodoContract.json";
import tokenAbi from "../abi/ToDoToken.json";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const TODO_CONTRACT_ADDRESS = "0x3FC698b08dB126376B9Ad72f7349Dd7db8a2CaE8";

export default function TaskList({ wallet }) {
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState("");
  const [balance, setBalance] = useState("0");

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
    if (contract) loadTasks();
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
          completedBy: task.completedBy,
        });
      }

      setTasks(taskList);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const completeTask = async (taskId) => {
    try {
      const tx = await contract.completeTask(taskId);
      await tx.wait();
      toast.success("✅ Task completed!");
      loadTasks();
    } catch (err) {
      toast.error("❌ Failed to complete task");
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
            {task.description}
            {task.isCompleted ? (
              <span> ✅</span>
            ) : (
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => completeTask(task.id)}
              >
                Complete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
