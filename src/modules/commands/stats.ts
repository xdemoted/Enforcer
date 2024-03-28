import { Client, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../data";
import { baseCommand, commandData } from "../commands";
export default class level extends baseCommand {
    static command = {
        "name": "stats",
        "description": "See your current stats in the server.",
        "options": [
            {
                "type": 6,
                "name": "user",
                "description": "Specify which user"
            }
        ]
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
    async execute(interaction: CommandInteraction) { // Replace this later with an actual stat board
        if (!(interaction.member instanceof GuildMember)) return false;
        let embed = new EmbedBuilder()
            .setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL() })
            .setFields([
                { name: 'XP', value: this.user.xp.toString(), inline: true },
                { name: 'Coins', value: (this.user.balance.wallet + this.user.balance.bank).toString(), inline: true },
                { name: 'Gems', value: this.memberManager.getGlobalUser().gems.toString(), inline: true },
                { name: 'Level', value: this.memberManager.getLevel().toString(), inline: true }
            ])
        interaction.reply({ embeds: [embed] })
        return true;
    }
}