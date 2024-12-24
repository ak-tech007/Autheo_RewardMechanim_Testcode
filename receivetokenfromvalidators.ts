const ethers = require('ethers');
import { toBech32, fromBech32 } from "@cosmjs/encoding";

const validatorAddress1 = "autheo18862yqj6pgllxdfzkmq7e20mexsav3mdgatvax";

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

const provider = new ethers.JsonRpcProvider("https://testnet-rpc1.autheo.com/")

//Decode the Bech32 address
const rawByte_validatorAddress1 = fromBech32(validatorAddress1).data;

// Convert the raw bytes to a hexadecimal string
const hex_validatorAddress1= "0x" + Buffer.from(rawByte_validatorAddress1).toString("hex");

console.log(hex_validatorAddress1);



// const validatorWallet = new ethers.Wallet(privateKey, provider);

// const tokenContract = new ethers.Contract(
    
// )

// const balance = validatorWallet.balanceOf();
// console.log(balance)