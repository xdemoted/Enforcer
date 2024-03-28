import { Client, CommandInteraction } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../../data";
import { baseCommand, commandData } from "../../commands";
export default class daily extends baseCommand {
    static command = {
        "name": "crash",
        "description": "Such a cruel existence."
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
        await interaction.reply(':saluting_face: Goodbye cruel world')
        setTimeout(() => {
            let x
            (x as any).crash()
        }, 1000)
        return true;
    }
}