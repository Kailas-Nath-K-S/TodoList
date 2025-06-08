// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ToDoToken.sol";

contract TodoContract {
    struct Task {
        uint id;
        string description;
        bool isCompleted;
        address completedBy;
    }

    TodoToken public token;
    address public owner;
    uint public taskCounter;

    mapping(address => bool) public admins;
    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string description);
    event TaskCompleted(uint id, address user, uint reward);

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
        tasks[taskCounter] = Task(taskCounter, description, false, address(0));
        emit TaskCreated(taskCounter, description);
    }
address[] public users;
   function completeTask(uint taskId) external {
    Task storage task = tasks[taskId];
    require(!task.isCompleted, "Already completed");
    task.isCompleted = true;
    task.completedBy = msg.sender;

    uint reward = 10 * 10**18; // 10 tokens
    token.mint(msg.sender, reward);

    if (!isUserExists(msg.sender)) {
        users.push(msg.sender);
    }

    emit TaskCompleted(taskId, msg.sender, reward);
}

function isUserExists(address user) internal view returns (bool) {
    for (uint i = 0; i < users.length; i++) {
        if (users[i] == user) {
            return true;
        }
    }
    return false;
}

function getUsers() public view returns (address[] memory) {
    return users;
}
    
}
