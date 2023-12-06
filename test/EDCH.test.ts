import { ethers } from "hardhat";
import { expect } from "chai";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EDCH } from "../typechain-types/contracts/EDCH";

describe("BSG Token Contract", async () => {
  let signers: SignerWithAddress[];
  let EDCH: EDCH;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async () => {
    // get owner as signer, account as customer
    signers = await ethers.getSigners();
    owner = signers[0];
    user = signers[1];

    // deploy smart contract
    const EDCHFactory = await ethers.getContractFactory("EDCH");
    EDCH = (await EDCHFactory.deploy()) as EDCH;
    await EDCH.deployed();
  });

  it('Started total supply MUST BE equal to "0"', async () => {
    expect(await EDCH.totalSupply()).equal("0");
  });

  it('Cap MUST BE equal to "100000000000000000000000000"', async () => {
    expect(await EDCH.cap()).equal("100000000000000000000000000");
  });

  it("Started owner MUST BE equal to deployer", async () => {
    expect(await EDCH.owner()).equal(owner.address);
    expect(await EDCH.getOwner()).equal(owner.address);
  });

  it('Name MUST BE equal to "EdChess Game"', async () => {
    expect(await EDCH.name()).equal("EdChess Game");
  });

  it('Symbol MUST BE equal to "EDCH"', async () => {
    expect(await EDCH.symbol()).equal("EDCH");
  });

  it('Decimals MUST BE equal to "18"', async () => {
    expect(await EDCH.decimals()).equal(18);
  });

  describe("Token minting", () => {
    const amountToMint = 10000;

    it('"totalSupply" MUST BE equal to minted amount', async () => {
      await EDCH.mint(amountToMint, owner.address);
      expect(await EDCH.totalSupply()).equal(amountToMint);

      await EDCH.mint(amountToMint, owner.address);
      expect(await EDCH.totalSupply()).equal(amountToMint * 2);
    });

    it('"totalSupply" MUST decrease on burning', async () => {
      await EDCH.mint(amountToMint, owner.address);
      expect(await EDCH.totalSupply()).equal(amountToMint);

      await EDCH.burn(amountToMint / 2);
      expect(await EDCH.totalSupply()).equal(amountToMint - amountToMint / 2);
    });

    it('"Owner" MUST HAVE balance equal to minted amount', async () => {
      await EDCH.mint(amountToMint, owner.address);

      expect(await EDCH.balanceOf(owner.address)).equal(amountToMint);
    });

    it("Any target MUST HAVE balance equal to minted amount", async () => {
      await EDCH.mint(amountToMint, user.address);

      expect(await EDCH.balanceOf(user.address)).equal(amountToMint);
    });

    it("MUST revert if the minter is not owner", async () => {
      await expect(EDCH.connect(user).mint(amountToMint, owner.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
      await expect(EDCH.connect(user).mint(amountToMint, user.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("MUST revert if the cap is over", async () => {
      // get total cap
      const cap = await EDCH.cap();

      // mint more than total cap
      await expect(EDCH.mint(cap.add(1), owner.address)).to.be.revertedWith("EDCH: cap exceeded");
      await expect(EDCH.mint(cap.add(100), owner.address)).to.be.revertedWith("EDCH: cap exceeded");
      await expect(EDCH.mint(cap.add(100000000000), owner.address)).to.be.revertedWith("EDCH: cap exceeded");

      // mint equal to total cap
      await EDCH.mint(cap, owner.address);

      // mint total cap + 1
      await expect(EDCH.mint(1, owner.address)).to.be.revertedWith("EDCH: cap exceeded");
    });
  });
});
