import { ActionRowBuilder, AttachmentBuilder, Client, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel } from "discord.js"
import { baseGame } from "../../gamemanager"
import { ContextUtilities, createGameCard, createImageCanvas, getPalette, numberedStringArraySingle, random } from "../../utilities"
import data, { GetFile, GuildMemberManager, MessageManager } from "../../data"
import { Canvas } from "canvas"
import axios, { Axios } from "axios"
class quoteData {
    _id!: string
    tags!: string[]
    content!: string
    author!: string
    authorSlug!: string
    length!: number
    dateAdded!: string
    dateModified!: string
}
export default class quotes extends baseGame {
    message: Message | undefined
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        if (this.channel instanceof TextChannel) {
            // Answer Setup
            let options:quoteData[] = (await axios.get('https://api.quotable.io/quotes/random?limit=4')).data
            if (options instanceof Array) {
                options = options.sort(() => Math.random() - 0.5)
                let correctIndex = random(0, 3)
                // Action Row Setup
                let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(new StringSelectMenuBuilder().setCustomId("quote").setPlaceholder("Select a country").addOptions(
                    options.map((option, index) => {
                        return { label: option.author, value: index.toString() }
                    })))
                let text = [
                    '# &fWho is the author of the quote?',
                    `## &7"&b${options[correctIndex].content}&7"`,
                    `&f- &7${options[0].author}`,
                    `&f- &7${options[1].author}`,
                    `&f- &7${options[2].author}`,
                    `&f- &7${options[3].author}`,
                    '&f ',
                    '{c}## &fUnanswered'
                ]
                let GameImage = await createGameCard('&fGuess the author', text, { color: [180,180,180] })
                let attachment = new AttachmentBuilder(GameImage.toBuffer(), { name: 'quote.png' })
                let message = await this.channel.send({ files: [attachment], components: [row] })
                this.message = message
                let collector = message.createMessageComponentCollector({ time: 3600000 })
                let answerers: String[] = []
                let CorrectAnswerers: String[] = []
                collector.on('collect', async interaction => {
                    if (interaction.customId == "quote" && interaction instanceof StringSelectMenuInteraction) {
                        if (answerers.includes(interaction.user.id)) interaction.reply({ content: "You have already answered.", ephemeral: true })
                        else {
                            answerers.push(interaction.user.id)
                            let user = new GuildMemberManager(data.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id))
                            if (interaction.values[0] == correctIndex.toString()) {
                                interaction.deferUpdate()
                                this.emit('correctanswer', interaction, 200)
                                CorrectAnswerers.push(interaction.user.id)
                                if (text[text.length - 1] == '{c}## &fUnanswered') {
                                    text.push('## Correct Answerers')
                                }
                                text.push('- &7' + interaction.member.displayName + '&f')
                                GameImage = await createGameCard('Flag Guesser', text, { color: [180,180,180] })
                                attachment = new AttachmentBuilder(GameImage.toBuffer(), { name: 'quote.png' })
                                message.edit({ files: [attachment], components: [row] })
                            } else {
                                user.addXP(25, this.channel.id)
                                user.userManager.addXP(25)
                                let rewardMsg = await interaction.reply({ content: MessageManager.getMessage('rewards.flagincorrect', [interaction.user.id, 25, options[correctIndex].author]), ephemeral: true })
                                setTimeout(() => {
                                    rewardMsg.delete()
                                }, 20000)
                            }
                        }
                    }
                })
            }
        }
    }
    end() {
        if (this.message) {
            if (this.message.deletable) this.message.delete()
        }
        if (this.collector) this.collector.stop();
    }

}