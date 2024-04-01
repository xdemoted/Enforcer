import { ActionRowBuilder, Client, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel } from "discord.js"
import { baseGame } from "../../gamemanager"
import { numberedStringArraySingle, random } from "../../utilities"
import data, { GetFile, GuildMemberManager, MessageManager } from "../../data"

export default class flags extends baseGame {
    message: Message | undefined
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        if (this.channel instanceof TextChannel) {
            let embed = new EmbedBuilder().setTitle("Flag Guesser").setDescription("Guess the country of the flag.").setTimestamp().setColor("Aqua")
            let codes: { countries: { [code: string]: string }, states: { [code: string]: string } } = require(GetFile.assets + '/countrycodes.json')
            let code = Object.keys(codes.countries)[random(0, Object.keys(codes.countries).length)]
            let options: string[] = []
            for (let i = 0; i < 3; i++) {
                let randomCode = Object.keys(codes.countries)[random(0, Object.keys(codes.countries).length)]
                while (randomCode == code || options.includes(randomCode)) {
                    randomCode = Object.keys(codes.countries)[random(0, Object.keys(codes.countries).length)]
                }
                options.push(randomCode)
            }
            options.push(code)
            options = options.sort(() => Math.random() - 0.5)
            let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(new StringSelectMenuBuilder().setCustomId("flag").setPlaceholder("Select a country").addOptions(
                options.map((option, index) => {
                    return { label: codes.countries[option], value: option }
                })))
            embed.setURL(`https://flagcdn.com/w2560/${code}.png`)
            embed.setImage(`https://flagcdn.com/w2560/${code}.png`)
            let message = await this.channel.send({ embeds: [embed], components: [row] })
            this.message = message
            let collector = message.createMessageComponentCollector({ time: 3600000 })
            let answerers: String[] = []
            let CorrectAnswerers: String[] = []
            collector.on('collect', async interaction => {
                if (interaction.customId == "flag" && interaction instanceof StringSelectMenuInteraction) {
                    if (answerers.includes(interaction.user.id)) interaction.reply({ content: "You have already answered.", ephemeral: true })
                    else {
                        answerers.push(interaction.user.id)
                        let user = new GuildMemberManager(data.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id))
                        console.log(code, options, interaction.values[0])
                        if (interaction.values[0] == code) {
                            interaction.deferUpdate()
                            this.emit('correctanswer', interaction, 200)
                            CorrectAnswerers.push(interaction.user.id)
                            embed.addFields([{ name: numberedStringArraySingle('', CorrectAnswerers.length - 1), value: interaction.member.displayName, inline: true }])
                            message.edit({ embeds: [embed], components: [row] })
                        } else {
                            user.addXP(25, this.channel.id)
                            user.userManager.addXP(25)
                            let rewardMsg = await interaction.reply({ content: MessageManager.getMessage('rewards.flagincorrect', [interaction.user.id, 25, codes.countries[code]]), ephemeral: true })
                            setTimeout(() => {
                                rewardMsg.delete()
                            }, 20000)
                        }
                    }
                }
            })
        }
    }
    end() {
        if (this.message) {
            if (this.message.deletable) this.message.delete()
        }
        if (this.collector) this.collector.stop();
    }

}