import abi from "./abis/rewardmechanismcontract.json"
import { Interface } from "ethers";
const iface = new Interface(abi);
const txData = "0xcb0c20c20000000000000000000000000000000000000000000000000000000000000000";
const decodedData = iface.decodeFunctionData("distributeDeveloperRewards", txData);
console.log(decodedData);