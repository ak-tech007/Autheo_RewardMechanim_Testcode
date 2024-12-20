"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var ethers_1 = require("ethers");
var fs = require("fs");
var path = require("path");
// Load environment variables
dotenv.config();
// Contract ABI (you'll need to expand this to include all relevant functions)
var CONTRACT_ABI = [
    "function registerLowBugBountyUsers(address[] memory _lowBugBountyUsers)",
    "function registerMediumBugBountyUsers(address[] memory _mediumBugBountyUsers)",
    "function registerHighBugBountyUsers(address[] memory _highBugBountyUsers)",
    "function registerContractDeploymentUsers(address[] memory _contractDeploymentUsers)",
    "function registerDappUsers(address[] memory _dappRewardsUsers, bool[] memory _userUptime)",
    "function totalSupply() view returns (uint256)",
    "function BUG_BOUNTY_ALLOCATION_PERCENTAGE() view returns (uint256)",
    "function LOW_PERCENTAGE() view returns (uint256)",
    "function MEDIUM_PERCENTAGE() view returns (uint256)",
    "function HIGH_PERCENTAGE() view returns (uint256)",
    "function DEVELOPER_REWARD_ALLOCATION_PERCENTAGE() view returns (uint256)",
    "function DAPP_REWARD_ALLOCATION_PERCENTAGE() view returns (uint256)",
    "function MONTHLY_DAPP_REWARD() view returns (uint256)",
    "function MONTHLY_UPTIME_BONUS() view returns (uint256)"
];
// Token ABI for transfer
var ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];
var WhitelistManager = /** @class */ (function () {
    function WhitelistManager(configPath) {
        var _this = this;
        // Load configuration from JSON
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        // Initialize providers, wallets, and contracts for each whitelist type
        this.providers = {};
        this.wallets = {};
        this.contracts = {};
        this.tokenContracts = {};
        var provider = new ethers_1.ethers.JsonRpcProvider(process.env.RPC_URL);
        // Initialize for each whitelist type
        var whitelistTypes = [
            'lowBugBounty',
            'mediumBugBounty',
            'highBugBounty',
            'contractDeployment',
            'dappUsers'
        ];
        whitelistTypes.forEach(function (type) {
            _this.providers[type] = provider;
            _this.wallets[type] = new ethers_1.ethers.Wallet(_this.config.validators[type].privateKey, provider);
            // Initialize contract instances
            _this.contracts[type] = new ethers_1.ethers.Contract(_this.config.contractAddress, CONTRACT_ABI, _this.wallets[type]);
            // Initialize token contract instances
            _this.tokenContracts[type] = new ethers_1.ethers.Contract(_this.config.tokenAddress, ERC20_ABI, _this.wallets[type]);
        });
    }
    WhitelistManager.prototype.calculateTotalRewardAmount = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, addresses, maxBps, totalSupply, _a, _b, lowAllocationPercentage, _c, lowPercentage, _d, mediumAllocationPercentage, _e, mediumPercentage, _f, highAllocationPercentage, _g, highPercentage, _h, devAllocationPercentage, _j, dappAllocationPercentage, _k, monthlyDappReward, _l, monthlyUptimeBonus, _m, baseReward, uptimeBonusTotal;
            var _o;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        console.log("we are here", type);
                        contract = this.contracts[type];
                        addresses = this.config.validators[type].addresses;
                        console.log(addresses, "addresses");
                        maxBps = BigInt(10000);
                        _a = BigInt;
                        return [4 /*yield*/, contract.totalSupply()];
                    case 1:
                        totalSupply = _a.apply(void 0, [_p.sent()]);
                        console.log(totalSupply, "totalSupply...");
                        _b = type;
                        switch (_b) {
                            case 'lowBugBounty': return [3 /*break*/, 2];
                            case 'mediumBugBounty': return [3 /*break*/, 5];
                            case 'highBugBounty': return [3 /*break*/, 8];
                            case 'contractDeployment': return [3 /*break*/, 11];
                            case 'dappUsers': return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 17];
                    case 2:
                        console.log("NOW IN LOW BOUNTY");
                        _c = BigInt;
                        return [4 /*yield*/, contract.BUG_BOUNTY_ALLOCATION_PERCENTAGE()];
                    case 3:
                        lowAllocationPercentage = _c.apply(void 0, [_p.sent()]);
                        _d = BigInt;
                        return [4 /*yield*/, contract.LOW_PERCENTAGE()];
                    case 4:
                        lowPercentage = _d.apply(void 0, [_p.sent()]);
                        console.log(lowPercentage.toString(), lowAllocationPercentage.toString(), "lowPercentage, lowAllocationPercentage ");
                        console.log(BigInt(addresses.length.toString()), " addresses length in low bounty");
                        return [2 /*return*/, ((totalSupply * lowAllocationPercentage / maxBps) *
                                lowPercentage / BigInt(100) /
                                BigInt(addresses.length))];
                    case 5:
                        console.log("NOW IN MEDIUM BOUNTY");
                        _e = BigInt;
                        return [4 /*yield*/, contract.BUG_BOUNTY_ALLOCATION_PERCENTAGE()];
                    case 6:
                        mediumAllocationPercentage = _e.apply(void 0, [_p.sent()]);
                        _f = BigInt;
                        return [4 /*yield*/, contract.MEDIUM_PERCENTAGE()];
                    case 7:
                        mediumPercentage = _f.apply(void 0, [_p.sent()]);
                        console.log({ mediumAllocationPercentage: mediumAllocationPercentage, mediumPercentage: mediumPercentage }, "mediumAllocationPercentage, mediumPercentage");
                        console.log(BigInt(addresses.length.toString()), " addresses length in medium bounty");
                        return [2 /*return*/, ((totalSupply * mediumAllocationPercentage / maxBps) *
                                mediumPercentage / BigInt(100) /
                                BigInt(addresses.length))];
                    case 8:
                        console.log("NOW IN HIGH BOUNTY");
                        _g = BigInt;
                        return [4 /*yield*/, contract.BUG_BOUNTY_ALLOCATION_PERCENTAGE()];
                    case 9:
                        highAllocationPercentage = _g.apply(void 0, [_p.sent()]);
                        _h = BigInt;
                        return [4 /*yield*/, contract.HIGH_PERCENTAGE()];
                    case 10:
                        highPercentage = _h.apply(void 0, [_p.sent()]);
                        console.log(highAllocationPercentage.toString(), highPercentage.toString(), "highAllocationPercentage, highPercentage");
                        console.log(BigInt(addresses.length.toString()), " addresses length in high bounty");
                        return [2 /*return*/, ((totalSupply * highAllocationPercentage / maxBps) *
                                highPercentage / BigInt(100) /
                                BigInt(addresses.length))];
                    case 11:
                        console.log("NOW IN CONTRACT DEVELOPMENT");
                        _j = BigInt;
                        return [4 /*yield*/, contract.DEVELOPER_REWARD_ALLOCATION_PERCENTAGE()];
                    case 12:
                        devAllocationPercentage = _j.apply(void 0, [_p.sent()]);
                        console.log(devAllocationPercentage, "dev Allocation Percentage");
                        return [2 /*return*/, (totalSupply * devAllocationPercentage / maxBps /
                                BigInt(addresses.length))];
                    case 13:
                        console.log("NOW IN CONTRACT dApp USERSS");
                        _k = BigInt;
                        return [4 /*yield*/, contract.DAPP_REWARD_ALLOCATION_PERCENTAGE()];
                    case 14:
                        dappAllocationPercentage = _k.apply(void 0, [_p.sent()]);
                        _l = BigInt;
                        return [4 /*yield*/, contract.MONTHLY_DAPP_REWARD()];
                    case 15:
                        monthlyDappReward = _l.apply(void 0, [_p.sent()]);
                        _m = BigInt;
                        return [4 /*yield*/, contract.MONTHLY_UPTIME_BONUS()];
                    case 16:
                        monthlyUptimeBonus = _m.apply(void 0, [_p.sent()]);
                        console.log({ monthlyDappReward: monthlyDappReward, monthlyUptimeBonus: monthlyUptimeBonus, dappAllocationPercentage: dappAllocationPercentage }, "monthlyDappReward, monthlyUptimeBonus, dappAllocationPercentage ");
                        baseReward = monthlyDappReward * BigInt(addresses.length);
                        uptimeBonusTotal = monthlyUptimeBonus * BigInt(((_o = this.config.validators.dappUsers.uptimeStatus) === null || _o === void 0 ? void 0 : _o.filter(function (status) { return status; }).length) || 0);
                        console.log({ uptimeBonusTotal: uptimeBonusTotal, baseReward: baseReward }, " uptimeBonusTotal, baseReward");
                        return [2 /*return*/, baseReward + uptimeBonusTotal];
                    case 17: throw new Error("Unsupported whitelist type: ".concat(type));
                }
            });
        });
    };
    WhitelistManager.prototype.transferTokensToContract = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenContract, wallet, rewardAmount, balance, approveTx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("we are here again...", type);
                        tokenContract = this.tokenContracts[type];
                        wallet = this.wallets[type];
                        console.log({ tokenContract: tokenContract, wallet: wallet }, "tokenContract, wallet ");
                        return [4 /*yield*/, this.calculateTotalRewardAmount(type)];
                    case 1:
                        rewardAmount = _a.sent();
                        console.log(rewardAmount.toString(), "reward Amount");
                        return [4 /*yield*/, tokenContract.balanceOf(wallet.address)];
                    case 2:
                        balance = _a.sent();
                        console.log(balance.toString(), "balance in transfer Tokens To Contract");
                        if (BigInt(balance) <= BigInt(rewardAmount)) {
                            throw new Error("Insufficient token balance for ".concat(type));
                        }
                        return [4 /*yield*/, tokenContract.approve(this.config.contractAddress, rewardAmount)];
                    case 3:
                        approveTx = _a.sent();
                        return [4 /*yield*/, approveTx.wait()];
                    case 4:
                        _a.sent();
                        console.log("Approved ".concat(ethers_1.ethers.formatEther(rewardAmount), " tokens for ").concat(type));
                        return [2 /*return*/];
                }
            });
        });
    };
    WhitelistManager.prototype.whitelistAddresses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        // Low Bug Bounty Users
                        return [4 /*yield*/, this.transferTokensToContract('lowBugBounty')];
                    case 1:
                        // Low Bug Bounty Users
                        _a.sent();
                        return [4 /*yield*/, this.contracts.lowBugBounty.registerLowBugBountyUsers(this.config.validators.lowBugBounty.addresses)];
                    case 2:
                        _a.sent();
                        // Medium Bug Bounty Users
                        return [4 /*yield*/, this.transferTokensToContract('mediumBugBounty')];
                    case 3:
                        // Medium Bug Bounty Users
                        _a.sent();
                        return [4 /*yield*/, this.contracts.mediumBugBounty.registerMediumBugBountyUsers(this.config.validators.mediumBugBounty.addresses)];
                    case 4:
                        _a.sent();
                        // High Bug Bounty Users
                        return [4 /*yield*/, this.transferTokensToContract('highBugBounty')];
                    case 5:
                        // High Bug Bounty Users
                        _a.sent();
                        return [4 /*yield*/, this.contracts.highBugBounty.registerHighBugBountyUsers(this.config.validators.highBugBounty.addresses)];
                    case 6:
                        _a.sent();
                        // Contract Deployment Users
                        return [4 /*yield*/, this.transferTokensToContract('contractDeployment')];
                    case 7:
                        // Contract Deployment Users
                        _a.sent();
                        return [4 /*yield*/, this.contracts.contractDeployment.registerContractDeploymentUsers(this.config.validators.contractDeployment.addresses)];
                    case 8:
                        _a.sent();
                        // Dapp Users
                        return [4 /*yield*/, this.transferTokensToContract('dappUsers')];
                    case 9:
                        // Dapp Users
                        _a.sent();
                        return [4 /*yield*/, this.contracts.dappUsers.registerDappUsers(this.config.validators.dappUsers.addresses, this.config.validators.dappUsers.uptimeStatus || [])];
                    case 10:
                        _a.sent();
                        console.log('All addresses whitelisted successfully!');
                        return [3 /*break*/, 12];
                    case 11:
                        error_1 = _a.sent();
                        console.error('Whitelisting failed:', error_1);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    return WhitelistManager;
}());
// Main execution
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var configPath, whitelistManager;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    configPath = path.join(__dirname, 'whitelistedAddress.json');
                    whitelistManager = new WhitelistManager(configPath);
                    return [4 /*yield*/, whitelistManager.whitelistAddresses()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
