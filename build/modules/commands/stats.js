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
class level extends commands_1.baseCommand {
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
            if (!(interaction.member instanceof discord_js_1.GuildMember))
                return false;
            let embed = new discord_js_1.EmbedBuilder()
                .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
                .setFields([
                { name: 'XP', value: this.user.xp.toString(), inline: true },
                { name: 'Coins', value: (this.user.balance.wallet + this.user.balance.bank).toString(), inline: true },
                { name: 'Gems', value: this.memberManager.getGlobalUser().gems.toString(), inline: true },
                { name: 'Level', value: this.memberManager.getLevel().toString(), inline: true }
            ]);
            interaction.reply({ embeds: [embed] });
            return true;
        });
    }
}
level.command = {
    "name": "stats",
    "description": "See your current stats in the server.",
    "options": [
        {
            "type": 6,
            "name": "user",
            "description": "Specify which user"
        }
    ]
};
exports.default = level;
