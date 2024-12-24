import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import CONTRACT_ABI from './abis/rewardmechanismcontract.json';
import ERC20_ABI from './abis/mytoken.json'

// Load environment variables
dotenv.config();

// Whitelist types
type WhitelistType =
    | 'lowBugBounty'
    | 'mediumBugBounty'
    | 'highBugBounty'
    | 'contractDeployment'
    | 'dappUsers';

interface WhitelistConfig {
    token:{
        deployedAddress:string;
        walletAddress:string;
        walletPrivateKey:string;
    };
    contract:{
        deployedAddress:string;
        walletAddress:string;
        walletPrivateKey:string;
    };
    validators: {
        [key in WhitelistType]: {
            privateKeys: string[];
            addresses: string[];
            uptimeStatus?: boolean[]; // Only for dappUsers
        };
    }
}


// const ownerAddress = 0x090323......

class WhitelistManager {
    private providers: { [key in WhitelistType]: ethers.Provider };
    private wallets: { [key in WhitelistType]: ethers.Wallet[] };  //each wallet
    private contractOwner: ethers.Contract; //contract which caller is Owner
    private contractWallet: ethers.Wallet;  //wallet address which owns the contract
    private tokenOwner: ethers.Contract;  //token which caller is Owner
    private tokenWallet: ethers.Wallet;  //wallet address which owns the token contract
    private contracts: { [key in WhitelistType]: ethers.Contract[] };  //contract which caller is each wallet
    private config: WhitelistConfig;


    constructor(configPath: string) {
        // Load configuration from JSON
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        // Initialize providers, wallets, and contracts for each whitelist type
        this.providers = {} as { [key in WhitelistType]: ethers.Provider };
        this.wallets = {} as { [key in WhitelistType]: ethers.Wallet[] };

        

        this.contracts = {} as { [key in WhitelistType]: ethers.Contract[] };
        

        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

        this.contractWallet = new ethers.Wallet(this.config.contract.walletPrivateKey, provider)
        this.tokenWallet = new ethers.Wallet(this.config.token.walletPrivateKey, provider)

        this.contractOwner = new ethers.Contract(
            this.config.contract.deployedAddress,
            CONTRACT_ABI,
            this.contractWallet
        );

        this.tokenOwner = new ethers.Contract(
            this.config.token.deployedAddress,
            ERC20_ABI,
            this.tokenWallet
        )


        // Initialize for each whitelist type
        const whitelistTypes: WhitelistType[] = [
            'lowBugBounty',
            'mediumBugBounty',
            'highBugBounty',
            'contractDeployment',
            'dappUsers'
        ];

        
        for (const type of whitelistTypes) {
            this.wallets[type] = []; // Initialize as an empty array
        }

        for (const type of whitelistTypes) {
            this.contracts[type] = []; // Initialize as an empty array
        }

        whitelistTypes.forEach(type => {
            this.providers[type] = provider;
            const privateKeys = this.config.validators[type].privateKeys

            for (let i = 0; i < privateKeys.length; i++) {
                this.wallets[type][i] = new ethers.Wallet(privateKeys[i], provider);
                // Initialize contract instances
                this.contracts[type][i] = new ethers.Contract(
                    this.config.contract.deployedAddress,
                    CONTRACT_ABI,
                    this.wallets[type][i]
                );

            }
                

            
            
            // this.tokenWallet = new ethers.Wallet(this.config.tokenPrivatekey, provider);

            
        });

        this.contractOwner.on("WhitelistUpdated", (claimType, user, month) => {
            console.log("whitelisted Type =====>", claimType);
            console.log("whitelisted User =====>", user);
            console.log("whitelisted month =====>", month);
        })

        this.contractOwner.on("TestnetStatusUpdated", (state) => {
            console.log("testnet State =====>", state);
        })
        this.contractOwner.on("Claimed", (claimType, user, value) => {
            console.log("claimed Type =====>", claimType);
            console.log("claimed User =====>", user)
            console.log("claimed Amount =====>", value)
        })
        
    }

    public async transferTokenToContract() {
        const totalAmount = BigInt(await this.tokenOwner.balanceOf(this.config.token.walletAddress));
            console.log(totalAmount) 
            const rewardAmount = BigInt(21000000000000000000000000)

            // const allowanceBefore = await this.tokenOwner.allowance(this.config.token.walletAddress, this.config.contract.deployedAddress);
            // console.log(`Allowance before: ${allowanceBefore.toString()}`);

            //transfer Autheo tokens from tokenOwner to deployed contract of reward distribution mechanism
            const tx_transfer = await this.tokenOwner.transfer(this.config.contract.deployedAddress, rewardAmount)
            await tx_transfer.wait();

            // const allowanceAfter = await this.tokenOwner.allowance(this.config.token.walletAddress, this.config.contract.deployedAddress);
            // console.log(`Allowance after: ${allowanceAfter.toString()}`);

    }

    public async transferNative() {
        try {

        const base64Data = "Y6qYrTfTeVGBfVweNx5vHrMY8kXkwMU43OKKrqc9zAlnDAq9/kGrO3+4zp2Zi4vcK+9syR4j97PEe1DBnJYudg==";

        // Decode Base64 to raw bytes
        const rawBytes = Buffer.from(base64Data.trim(), 'base64');

        const privateKeyBytes = rawBytes.slice(0, 32);

        if (privateKeyBytes.length !== 32) {
            throw new Error(`Invalid private key length: ${privateKeyBytes.length}. Expected 32 bytes.`);
          }

        // Print the raw bytes as a Buffer object
        // console.log(rawBytes);

        // If you want to display it as a hexadecimal string
        const privateKey = privateKeyBytes.toString('hex');
        console.log(privateKey);

        const provider = new ethers.JsonRpcProvider("https://testnet-rpc1.autheo.com/")

        const validatorWallet = new ethers.Wallet(privateKey, provider);

        const recipient = "0xAeBbcbee2736786Af9Fc47A7cCC5CC3BF2caD673"; // Replace with the recipient's address
        const amount = ethers.parseEther("1.0"); // Amount to send (1 token in this example)
        const tx = await validatorWallet.sendTransaction({
        to: recipient,
        value: amount,
        });

        // const tx = {
        //     to: contractAddress,
        //     data: contract.interface.encodeFunctionData("functionName", [args]),
        //     gasLimit: ethers.utils.hexlify(100000), // Example gas limit
        //   };
        //   const transaction = await signer.sendTransaction(tx);
        //   await transaction.wait();

        const receipt = await tx.wait(); // Wait for transaction confirmation
        console.log(`Transaction Hash: ${tx.hash}`);
        // console.log(`Transaction Confirmed: ${receipt.transactionHash}`);
        } catch (error) {
        console.error(`Error in native transfer: ${error}`);
        } 
    }
    

    public async whitelistAddresses() {
        try {

            //transfer autheo tokens to deployed contract            
            await this.transferTokenToContract();
            
            // Low Bug Bounty Users
            const tx_registerLowBugBountyUsers = await this.contractOwner.registerLowBugBountyUsers(
                this.config.validators.lowBugBounty.addresses
            );
            await tx_registerLowBugBountyUsers.wait();
            

            // Medium Bug Bounty Users
            const tx_registerMediumBugBountyUsers = await this.contractOwner.registerMediumBugBountyUsers(
                this.config.validators.mediumBugBounty.addresses
            );
            await tx_registerMediumBugBountyUsers.wait();

            // High Bug Bounty Users
            const tx_registerHighBugBountyUsers = await this.contractOwner.registerHighBugBountyUsers(
                this.config.validators.highBugBounty.addresses
            );
            await tx_registerHighBugBountyUsers.wait();

            // Contract Deployment Users
            const tx_registerContractDeploymentUsers = await this.contractOwner.registerContractDeploymentUsers(
                this.config.validators.contractDeployment.addresses
            );
            await tx_registerContractDeploymentUsers.wait()

            // Dapp Users
            const tx_registerDappUsers = await this.contractOwner.registerDappUsers(
                this.config.validators.dappUsers.addresses,
                this.config.validators.dappUsers.uptimeStatus || []
            );
            await tx_registerDappUsers.wait();

            console.log('All addresses whitelisted successfully!');
        } catch (error) {
            console.error('Whitelisting failed:', error);
        }
    }

    public async claim() {

        try {
            
        //stop Testnet and distribute rewards to developers and dapp users
        const tx_setTestnetStatus = await this.contractOwner.setTestnetStatus(false);
        await tx_setTestnetStatus.wait()

        //claim contract deploymentUsers and bugBountyRewardUsers
        const tx_claimRewardContractDeploymentUser = await this.contracts.contractDeployment[1].claimReward(true, false, false);
        await tx_claimRewardContractDeploymentUser.wait();
        
        
        //claim dappUserRewards
        const tx_claimDappReward1 = await this.contracts.dappUsers[1].claimReward(false, true, false);
        await tx_claimDappReward1.wait();

        //claim dappUserRewards
        const tx_claimDappReward0 = await this.contracts.dappUsers[0].claimReward(false, true, false);
        await tx_claimDappReward0.wait();
        
        //claim contract deploymentUsers and bugBountyRewardUsers
        const tx_claimRewardBugBountyUser_medium = await this.contracts.mediumBugBounty[2].claimReward(false, false, true);
        await tx_claimRewardBugBountyUser_medium.wait();

        //claim contract deploymentUsers and bugBountyRewardUsers
        const tx_claimRewardBugBountyUser_low = await this.contracts.lowBugBounty[0].claimReward(false, false, true);
        await tx_claimRewardBugBountyUser_low.wait();

        //claim contract deploymentUsers and bugBountyRewardUsers
        const tx_claimRewardBugBountyUser_high = await this.contracts.highBugBounty[0].claimReward(false, false, true);
        await tx_claimRewardBugBountyUser_high.wait();

        console.log("claimed successfully")

        } catch (error) {
            console.log("claiming failed", error)
        }
   
        
    }
}

// Main execution
async function main() {
    const configPath = path.join(__dirname, 'whitelistedAddress.json');
    const whitelistManager = new WhitelistManager(configPath);
    // await whitelistManager.transferNative();
    // await whitelistManager.whitelistAddresses();
    await whitelistManager.claim();
}

main().catch(console.error);
