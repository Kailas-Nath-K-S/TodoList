const { ethers } = require("hardhat");

async function main() {
  // Deploy the ERC20 Token
  const TodoToken = await ethers.getContractFactory("TodoToken");
  const token = await TodoToken.deploy();
  await token.waitForDeployment();
  console.log("TodoToken deployed to:", token.target);

  // Deploy the Todo Contract
  const TodoContract = await ethers.getContractFactory("TodoContract");
  const todo = await TodoContract.deploy(token.target);
  await todo.waitForDeployment();
  console.log("TodoContract deployed to:", todo.target);

  // Set TodoContract as admin to mint tokens
  const tx = await token.setAdmin(todo.target);
  await tx.wait();
  console.log("Token admin set to TodoContract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
