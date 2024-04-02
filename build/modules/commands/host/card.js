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
const discord_js_1 = require("discord.js");
const data_1 = require("../../data");
const commands_1 = require("../../commands");
class xp extends commands_1.baseCommand {
    constructor(commandData) {
        super(commandData);
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let amount = (_a = interaction.options.get('amount')) === null || _a === void 0 ? void 0 : _a.value;
            let type = (_b = interaction.options.get('type')) === null || _b === void 0 ? void 0 : _b.value;
            let user = (_c = interaction.options.get('user')) === null || _c === void 0 ? void 0 : _c.user;
            if (user instanceof discord_js_1.User) {
                this.memberManager = new data_1.GuildMemberManager(this.serverManager.getMember(user.id));
            }
            else {
                user = interaction.user;
            }
            if (typeof type == 'string' && typeof amount == 'number') {
                switch (type) {
                    case 'set':
                        {
                            this.memberManager.setXP(amount);
                            interaction.reply(`<@${user.id}>'s xp has been set to ${amount}.`);
                        }
                        break;
                    case 'remove':
                        {
                            this.memberManager.removeXP(amount);
                            interaction.reply(`<@${user.id}> has been revoked ${amount} xp.`);
                        }
                        break;
                    case 'give':
                        {
                            this.memberManager.addXP(amount);
                            interaction.reply(`<@${user.id}> has been given ${amount} xp.`);
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
xp.command = {
    "name": "card",
    "description": "Run this manage user xp.",
    "options": [
        {
            "type": 6,
            "name": "user",
            "description": "Specify which user"
        }
    ]
};
exports.default = xp;
