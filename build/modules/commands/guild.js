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
class daily extends commands_1.baseCommand {
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
            let discordGuild = interaction.guild;
            let guild = this.serverManager;
            if (discordGuild) {
                let level = 0;
                do {
                    level++;
                } while (this.serverManager.guild.xp >= (5 * (level ** 2) + (50 * level) + 100));
                let guildRank = this.data.cacheData.guilds.sort((a, b) => b.xp - a.xp).findIndex(g => g.id == guild.id) + 1;
                let embed = new discord_js_1.EmbedBuilder()
                    .setImage(discordGuild.iconURL())
                    .setTitle(discordGuild.name)
                    .setFields([
                    {
                        name: 'Level',
                        value: level.toString(),
                    },
                    {
                        name: 'XP',
                        value: guild.guild.xp.toString(),
                    },
                    {
                        name: 'Rank',
                        value: guildRank.toString(),
                    }
                ]);
                let message = yield interaction.reply({ embeds: [embed] });
                setTimeout(() => {
                    message.delete();
                }, 20000);
            }
            return true;
        });
    }
}
daily.command = {
    "name": "guild",
    "description": "Look at those stats."
};
exports.default = daily;
