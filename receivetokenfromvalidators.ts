const ethers = require('ethers');

const base64Data = "Y6qYrTfTeVGBfVweNx5vHrMY8kXkwMU43OKKrqc9zAlnDAq9/kGrO3+4zp2Zi4vcK+9syR4j97PEe1DBnJYudg==";

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

// Decode Base64 to raw bytes
const rawBytes = Buffer.from(base64Data, 'base64');

// Print the raw bytes as a Buffer object
// console.log(rawBytes);

// If you want to display it as a hexadecimal string
const privateKey = rawBytes.toString('hex');
console.log(privateKey);

const provider = new ethers.JsonRpcProvider("https://testnet-rpc1.autheo.com/")

const validatorWallet = new ethers.Wallet(privateKey, provider);

const tokenContract = new ethers.Contract(
    
)

const balance = validatorWallet.balanceOf();
console.log(balance)