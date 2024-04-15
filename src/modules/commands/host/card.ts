import { Client, CommandInteraction, User } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../../data";
import { baseCommand, commandData } from "../../commands";
export default class xp extends baseCommand {
    static command = {
        "name": "card",
        "description": "Run this to manage user xp.",
        "options": [
            {
                "type": 3,
                "name": "type",
                "description": "Specify the type of action"
            },
            {
                "type": 6,
                "name": "user",
                "description": "Specify which user"
            },
            {
                "type": 4,
                "name": "amount",
                "description": "Specify the amount of xp"
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
        let amount = interaction.options.get('amount')?.value
        let type = interaction.options.get('type')?.value
        let user = interaction.options.get('user')?.user
        if (user instanceof User) {
            this.memberManager = new GuildMemberManager(this.serverManager.getMember(user.id))
        } else {
            user = interaction.user
        }
        if (typeof type == 'string' && typeof amount == 'number') {
            switch (type) {
                case 'set': {
                    this.memberManager.setXP(amount)
                    interaction.reply(`<@${user.id}>'s xp has been set to ${amount}.`)
                }
                    break;
                case 'remove': {
                    this.memberManager.removeXP(amount)
                    interaction.reply(`<@${user.id}> has been revoked ${amount} xp.`)
                }
                    break;
                case 'give': {
                    this.memberManager.addXP(amount)
                    interaction.reply(`<@${user.id}> has been given ${amount} xp.`)
                }
                    break;
                default:
                    interaction.reply('Type Error: Xp Command')
                    break;
            }
        } else {
            interaction.reply('Data Error: Xp Command')
        }
        return true
    }
}