import { ethers } from "hardhat";
import { EDCH } from "../typechain-types/contracts/EDCH";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const EDCHFactory = await ethers.getContractFactory("EDCH");
  const EDCH = (await EDCHFactory.deploy()) as EDCH;

  await EDCH.deployed();

  console.log("EDCH deployed: ", EDCH.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
