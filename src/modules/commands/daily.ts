import { Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember, UserManager } from "../data";
import { baseCommand, commandData } from "../commands";
import { random } from "../utilities";
export default class daily extends baseCommand {
    static command = {
        "name": "daily",
        "description": "Run this command daily for rewards.",
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
        if (Date.now() >= (this.memberManager.getTimer('daily') + 64800000)) {
            let xp = random(150, 250)
            let gem = random(10, 15)
            let currency = random(20, 100)
            this.memberManager.addXP(xp, interaction.channelId)
            this.memberManager.addWallet(currency)
            let guser = new UserManager(this.memberManager.getGlobalUser())
            guser.addGems(gem)
            guser.addXP(xp)
            let embed = new EmbedBuilder()
                .setColor('LuminousVividPink')
                .setTitle('Daily Rewards')
                .setDescription('Come back tomorrow for more rewards!')
                .setFields([{ name: 'XP', inline: true, value: xp.toString() }, { name: 'Currency', inline: true, value: currency.toString() }, { name: 'Gems', inline: true, value: gem.toString() }])
            this.memberManager.setTimer('daily', Date.now())
            let reply = await interaction.reply({ embeds: [embed] })
            setTimeout(() => {
                reply.delete()
            }, 20000);
        } else {
            interaction.reply({ephemeral:true,content:`You can recieve more rewards at <t:${Math.round((this.memberManager.getTimer('daily') + 64800000) / 1000)}:t>`})
        }
        return true;
    }
}