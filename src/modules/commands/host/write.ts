import { Client, CommandInteraction } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../../data";
import { baseCommand, commandData } from "../../commands";
export default class write extends baseCommand {
    static command = {
        "name": "write",
        "description": "Forcefully update the cache.",
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
        this.data.write()
        interaction.reply({content:"Cache written.",ephemeral: true})
        return true
    }
}