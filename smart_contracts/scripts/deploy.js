/* eslint-disable @typescript-eslint/no-require-imports */
const { ethers } = require('hardhat');
const { exportAddresses } = require('./export-addresses');

async function main() {
  const feeCollector = process.env.FEE_COLLECTOR;

  if (!feeCollector) {
    throw new Error('FEE_COLLECTOR environment variable is not set.');
  }

  console.log(
    'Deploying ShifumiGame contract with feeCollector:',
    feeCollector,
  );
  const ShifumiGame = await ethers.getContractFactory('ShifumiGame');
  const shifumiGame = await ShifumiGame.deploy(feeCollector);

  await shifumiGame.waitForDeployment();

  const address = await shifumiGame.getAddress();
  // Export address to frontend
  exportAddresses(
    'ShifumiGame',
    address,
    process.env.HARDHAT_NETWORK || 'localhost',
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
