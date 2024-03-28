import { Client, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../data";
import { baseCommand, commandData } from "../commands";
export default class balance extends baseCommand {
    static command = {
        "name": "balance",
        "description": "Access your bank.",
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
    async execute(interaction: CommandInteraction) {
        let member = interaction.member
        if (!(member instanceof GuildMember)) return false;
        let amember = interaction.options.get("user")?.member
        if (amember instanceof GuildMember) {
            member = amember
            this.user = this.serverManager.getMember(member.id)
        }
        let embed = new EmbedBuilder()
            .setAuthor({ name: member.displayName, iconURL: member.displayAvatarURL() })
            .setFields([
                { name: 'Wallet', value: (this.user.balance.wallet).toString(), inline: true },
                { name: 'Bank', value: (this.user.balance.bank).toString(), inline: true },
                { name: 'Gems', value: this.memberManager.getGlobalUser().gems.toString(), inline: true },])
        let message = await interaction.reply({ embeds: [embed] })
        setTimeout(() => {
            message.delete()
        }, 20000);
        return true;
    }
}