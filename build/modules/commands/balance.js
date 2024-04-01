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
const commands_1 = require("../commands");
class balance extends commands_1.baseCommand {
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
            var _a;
            let member = interaction.member;
            if (!(member instanceof discord_js_1.GuildMember))
                return false;
            let amember = (_a = interaction.options.get("user")) === null || _a === void 0 ? void 0 : _a.member;
            if (amember instanceof discord_js_1.GuildMember) {
                member = amember;
                this.user = this.serverManager.getMember(member.id);
            }
            let embed = new discord_js_1.EmbedBuilder()
                .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
                .setFields([
                { name: 'Wallet', value: (this.user.balance.wallet).toString(), inline: true },
                { name: 'Bank', value: (this.user.balance.bank).toString(), inline: true },
                { name: 'Gems', value: this.memberManager.getGlobalUser().gems.toString(), inline: true },
            ]);
            let message = yield interaction.reply({ embeds: [embed] });
            setTimeout(() => {
                message.delete();
            }, 20000);
            return true;
        });
    }
}
balance.command = {
    "name": "balance",
    "description": "Access your bank.",
    "options": [
        {
            "type": 6,
            "name": "user",
            "description": "Specify which user"
        }
    ]
};
exports.default = balance;
