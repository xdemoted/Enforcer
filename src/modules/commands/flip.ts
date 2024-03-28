import { Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember } from "../data";
import { baseCommand, commandData } from "../commands";
import { random } from "../utilities";
export default class daily extends baseCommand {
    static command = {
        "name": "flip",
        "description": "flip a coin for a chance to double your bet.",
        "options": [
            {
                "type": 4,
                "name": "bet",
                "description": "the amount of coins to bet",
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
        let bet = interaction.options.get('bet')?.value
        if (this.memberManager.getTimer('flip') + 30000 < Date.now()) {
            if (typeof bet == 'number' && bet >= 50) {
                if (typeof bet == 'number' && this.user.balance.wallet > bet) {
                    this.memberManager.setTimer('flip', Date.now())
                    let win = random(0, 1)
                    let embed = new EmbedBuilder()
                        .setThumbnail(win ? 'https://cdn.discordapp.com/attachments/1040422701195603978/1106274390527705168/R.gif' : 'https://cdn.discordapp.com/attachments/858439510425337926/1106440676884893716/broken_coin.png')
                        .setTitle(win ? `It's your Lucky day!` : `Better luck next time`)
                        .setDescription(win ? `Successfully earned ${bet} coins` : `Lost ${bet} coins`)
                        .setFooter({text:'You can flip again in 30 seconds.'})
                        .setColor('Yellow')
                    if (win == 0) {
                        this.memberManager.removeWallet(bet)
                    } else {
                        this.memberManager.addWallet(bet)
                    }
                    let message = await interaction.reply({ embeds: [embed] })
                    setTimeout(() => {
                        message.delete()
                    }, 20000);
                } else {
                    interaction.reply({ content: `You're gonna need more coins to make this bet.`, ephemeral: true })
                }
            } else {
                interaction.reply({ content: 'You need to bet atleast 50 coins.', ephemeral: true })
            }
        } else {
            interaction.reply({ content: `You can flip again at <t:${Math.round((this.memberManager.getTimer('flip') + 30000) / 1000)}:t>`, ephemeral: true })
        }
        return true;
    }
}