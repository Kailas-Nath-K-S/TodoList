const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Todo DApp", function () {
  let todoToken, todoContract;
  let admin, user1, user2;

  beforeEach(async function () {
    [admin, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TodoToken");
    todoToken = await Token.connect(admin).deploy();
    await todoToken.waitForDeployment();

    const Todo = await ethers.getContractFactory("TodoContract");
    todoContract = await Todo.connect(admin).deploy(todoToken.target);
    await todoContract.waitForDeployment();

    // Set TodoContract as admin of token
    await todoToken.connect(admin).setAdmin(todoContract.target);
  });

  it("should allow admin to create tasks", async function () {
    await todoContract.connect(admin).createTask("Test Task");
    const task = await todoContract.tasks(1);
    expect(task.description).to.equal("Test Task");
  });

  it("should allow user to complete task and receive tokens", async function () {
    await todoContract.connect(admin).createTask("Test Task");
    await todoContract.connect(user1).completeTask(1);
    const balance = await todoToken.balanceOf(user1.address);
    expect(balance.toString()).to.equal(ethers.parseEther("10").toString());
  });

  it("should track users for leaderboard", async function () {
    await todoContract.connect(admin).createTask("Task 1");
    await todoContract.connect(user1).completeTask(1);

    await todoContract.connect(admin).createTask("Task 2");
    await todoContract.connect(user2).completeTask(2);

    const users = await todoContract.getUsers();
    expect(users).to.include.members([user1.address, user2.address]);
  });

  it("should not allow non-admin to create tasks", async function () {
    await expect(todoContract.connect(user1).createTask("Nope"))
      .to.be.revertedWith("Not an admin");
  });
});
