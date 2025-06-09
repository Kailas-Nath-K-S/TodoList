// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ToDoToken.sol";

contract TodoContract {
    struct Task {
        uint id;
        string description;
        bool isCompleted;
        address completedBy;
        bool isVerified;
    }

    TodoToken public token;
    address public owner;
    uint public taskCounter;

    mapping(address => bool) public admins;
    mapping(uint => Task) public tasks;
    address[] public users;

    event TaskCreated(uint id, string description);
    event TaskMarkedCompleted(uint id, address user);
    event TaskVerified(uint id, address user, uint reward);

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not an admin");
        _;
    }

    constructor(address _token) {
        token = TodoToken(_token);
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    function addAdmin(address newAdmin) external onlyAdmin {
        admins[newAdmin] = true;
    }

    function createTask(string memory description) external onlyAdmin {
        taskCounter++;
        tasks[taskCounter] = Task(taskCounter, description, false, address(0), false);
        emit TaskCreated(taskCounter, description);
    }

    function markTaskCompleted(uint taskId) external {
        Task storage task = tasks[taskId];
        require(!task.isCompleted, "Already marked completed");
        require(task.completedBy == address(0), "Already submitted");

        task.completedBy = msg.sender;
        task.isCompleted = true;

        if (!isUserExists(msg.sender)) {
            users.push(msg.sender);
        }

        emit TaskMarkedCompleted(taskId, msg.sender);
    }

    function verifyTask(uint taskId) external onlyAdmin {
        Task storage task = tasks[taskId];
        require(task.isCompleted, "Task not yet completed");
        require(!task.isVerified, "Already verified");

        task.isVerified = true;
        uint reward = 10 * 10**18;
        token.mint(task.completedBy, reward);

        emit TaskVerified(taskId, task.completedBy, reward);
    }

    function isUserExists(address user) internal view returns (bool) {
        for (uint i = 0; i < users.length; i++) {
            if (users[i] == user) return true;
        }
        return false;
    }

    function getUsers() public view returns (address[] memory) {
        return users;
    }
}
