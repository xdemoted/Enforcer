import { ActionRowBuilder, AttachmentBuilder, Client, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel } from "discord.js"
import { baseGame } from "../../gamemanager"
import { ContextUtilities, createGameCard, createImageCanvas, getPalette, numberedStringArraySingle, random } from "../../utilities"
import data, { GetFile, GuildMemberManager, MessageManager } from "../../data"
import { Canvas } from "canvas"

function generateFlag(strokeColor: [number, number, number]) {
    let canvas = new Canvas(250, 250)
    let ctx = canvas.getContext('2d');
    let ctxUtils = new ContextUtilities(ctx as unknown as CanvasRenderingContext2D);
    ctx.fillStyle = `rgb(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]})`
    ctxUtils.roundedRect(63, 25, 10, 200, 5, 0)
    ctx.fill()
    ctxUtils.roundedRect(78, 25, 100, 75, 5, 10)
    ctx.strokeStyle = `rgb(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]})`
    ctx.stroke()
    return canvas;
}

export default class flags extends baseGame {
    message: Message | undefined
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        if (this.channel instanceof TextChannel) {
            // Answer Setup
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
            // Action Row Setup
            let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(new StringSelectMenuBuilder().setCustomId("flag").setPlaceholder("Select a country").addOptions(
                options.map((option, index) => {
                    return { label: codes.countries[option], value: option }
                })))
            // Image Setup
            let image = await createImageCanvas(`https://flagcdn.com/w2560/${code}.png`, [460, 0], 10)
            const palette = await getPalette(image)
            let color: [number, number, number] = palette[0].color.map((color) => Math.round(color * 0.71)) as [number, number, number]
            if (color[0] < 50 && color[1] < 50 && color[2] < 50) color = [180, 180, 180]
            let GameImageDesc = [image, '# &fWhich Country is This?']
                .concat(options.map((option) => { return `- &7${codes.countries[option]}&f` }))
            GameImageDesc.push(' ')
            let GameImage = await createGameCard('&fFlag Guesser', GameImageDesc, { color: color, icon: generateFlag([255, 255, 255]) })
            let attachment = new AttachmentBuilder(GameImage.toBuffer(), { name: 'flag.png' })
            let message = await this.channel.send({ files: [attachment], components: [row] })
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
                        if (interaction.values[0] == code) {
                            interaction.deferUpdate()
                            this.emit('correctanswer', interaction, 200)
                            CorrectAnswerers.push(interaction.user.id)
                            if (GameImageDesc[GameImageDesc.length - 1] == ' ') {
                                GameImageDesc.push('## Correct Answerers')
                            }
                            GameImageDesc.push('- &7' + interaction.member.displayName + '&f')
                            GameImage = await createGameCard('Flag Guesser', GameImageDesc, { color: color, icon: generateFlag([255, 255, 255]) })
                            attachment = new AttachmentBuilder(GameImage.toBuffer(), { name: 'flag.png' })
                            message.edit({ files: [attachment], components: [row] })
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