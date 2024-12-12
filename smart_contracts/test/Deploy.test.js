/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-require-imports */

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ShifumiGame Deployment', function () {
  it('Should deploy with a valid fee collector address', async function () {
    const [owner] = await ethers.getSigners();
    const ShifumiGameFactory = await ethers.getContractFactory('ShifumiGame');
    const shifumiGame = await ShifumiGameFactory.deploy(owner.address);

    await shifumiGame.waitForDeployment();

    expect(await shifumiGame.feeCollector()).to.equal(owner.address);
  });

  it('Should reject deployment with zero address', async function () {
    const ShifumiGameFactory = await ethers.getContractFactory('ShifumiGame');
    await expect(
      ShifumiGameFactory.deploy(ethers.ZeroAddress),
    ).to.be.revertedWith('Invalid fee collector address');
  });
});
