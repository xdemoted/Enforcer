import { Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember, UserManager } from "../data";
import { baseCommand, commandData } from "../commands";
import { random } from "../utilities";
export default class daily extends baseCommand {
    static command = {
        "name": "guild",
        "description": "Look at those stats."
    }
    client: Client;
    data: DataManager;
    memberManager: GuildMemberManager;
    user: GMember;
    serverManager: GuildManager;
    constructor(commandData: commandData) {
        super(commandData)
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    async execute(interaction: CommandInteraction) {
        let discordGuild = interaction.guild
        let guild = this.serverManager
        if (discordGuild) {
            let level = 0
            do {
                level++
            } while (this.serverManager.guild.xp >= (5 * (level ** 2) + (50 * level) + 100))
            let guildRank = this.data.cacheData.guilds.sort((a, b) => b.xp - a.xp).findIndex(g => g.id == guild.id) + 1
            let embed = new EmbedBuilder()
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
                ])
            let message = await interaction.reply({ embeds: [embed] })
            setTimeout(() => {
                message.delete()
            }, 20000);
        }
        return true;
    }
}