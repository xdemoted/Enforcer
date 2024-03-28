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
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../../data");
const commands_1 = require("../../commands");
class gem extends commands_1.baseCommand {
    constructor(commandData) {
        super(commandData);
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    execute(interaction) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let amount = (_a = interaction.options.get('amount')) === null || _a === void 0 ? void 0 : _a.value;
            let type = (_b = interaction.options.get('type')) === null || _b === void 0 ? void 0 : _b.value;
            let user = (_c = interaction.options.get('user')) === null || _c === void 0 ? void 0 : _c.value;
            let userManager = this.memberManager.getUserManager();
            if (typeof user == 'string') {
                userManager = new data_1.GuildMemberManager(this.serverManager.getMember(user)).getUserManager();
            }
            else {
                user = interaction.user.id;
            }
            if (typeof type == 'string' && typeof amount == 'number') {
                switch (type) {
                    case 'set':
                        {
                            userManager.setGems(amount);
                            interaction.reply(`Set <@${user}>'s gems to ${amount}`);
                        }
                        break;
                    case 'remove':
                        {
                            userManager.removeGems(amount);
                            interaction.reply(`Removing ${amount} gems from <@${user}>`);
                        }
                        break;
                    case 'give':
                        {
                            userManager.addGems(amount);
                            interaction.reply(`Giving ${amount} gems to <@${user}>`);
                        }
                        break;
                    default:
                        interaction.reply('Type Error: Xp Command');
                        break;
                }
            }
            else {
                interaction.reply('Data Error: Xp Command');
            }
            return true;
        });
    }
}
gem.command = {
    "name": "gem",
    "description": "Manage the gems of a user",
    "options": [
        {
            "type": 3,
            "name": "type",
            "description": "Give | Set | Remove",
            "choices": [
                {
                    "name": "give",
                    "value": "give"
                },
                {
                    "name": "set",
                    "value": "set"
                },
                {
                    "name": "remove",
                    "value": "remove"
                }
            ],
            "required": true
        },
        {
            "type": 6,
            "name": "user",
            "description": "User to be rewarded",
            "required": true
        },
        {
            "type": 4,
            "name": "amount",
            "description": "Amount of gems",
            "required": true
        }
    ]
};
exports.default = gem;
