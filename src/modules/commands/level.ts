import { AttachmentBuilder, Client, CommandInteraction, GuildMember } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../data";
import { baseCommand, commandData } from "../commands";
import { getNamecard } from "../utilities";

export default class level extends baseCommand {
    static command = {
        "name": "level",
        "description": "See your current level in the server.",
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
        let auser = interaction.options.get("user")?.user
        if (auser) {
            this.user = this.serverManager.getMember(auser.id)
        }
        let member: GuildMember | undefined = interaction.guild?.members.cache.get(this.user.id)
        if (member instanceof GuildMember) {
            let attachment = new AttachmentBuilder((await getNamecard(member, this.data)).toBuffer('image/png'))
            interaction.reply({ files: [attachment] })
        }
        return true
    }
}