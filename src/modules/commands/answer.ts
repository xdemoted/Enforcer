import { Client, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../data";
import { baseCommand, commandData } from "../commands";
export default class answer extends baseCommand {
    static command = {
        "name": "answer",
        "description": "Use this to answer quizbowl questions in the right channel.",
        "options": [
            {
                "type": 3,
                "name": "answer",
                "description": "answer",
                "required": true
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
        setTimeout(() => {
            if (!interaction.deferred&&!interaction.replied) interaction.reply({ephemeral:true, content:"No response was received from QB. Please check the channel or report the issue."})
        }, 2500);
        return true
    }
}