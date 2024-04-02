import { ActionRowBuilder, AttachmentBuilder, Client, CommandInteraction, ComponentType, EmbedBuilder, GuildMember, StringSelectMenuBuilder } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember, UserManager, GetFile } from "../data";
import { baseCommand, commandData } from "../commands";
import { addFrame, createCatalog, random } from "../utilities";
export default class daily extends baseCommand {
    static command = {
        "name": "catalog",
        "description": "Use this to find cards."
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
        let manifest = GetFile.tradecardManifest()
        let catalogs = manifest.collections
        let catalogOptions = catalogs.map(catalog => ({
            label: catalog.title,
            value: catalog.id.toString()
        }));
        let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('catalog')
                .setPlaceholder('Select a catalog')
                .addOptions(catalogOptions)
        )
        await interaction.reply({ content: "Select a catalog", components: [row] })
        let message = await interaction.fetchReply()
        let collector = interaction.channel?.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000, filter: m => m.message.id == message.id })
        collector?.on('collect', async i => {
            await i.deferUpdate()
            console.log(catalogs.map(catalog => ({ id: catalog.id.toString() == i.values[0] })))
            console.log(i.values[0])
            let catalog = catalogs.find(c => c.id.toString() == i.values[0])
            if (catalog == undefined) { i.update({ content: "Catalog not found." }); return }
            let cardIDs = catalog.cards
            let cards: {
                id: number;
                title: string;
                rank: number | string
                description: string;
                background: string;
            }[] = []
            for (let card of cardIDs) {
                let c = manifest.cards.find(c => c.id == card)
                if (c) cards.push(c)
            }
            let cardOptions = cards.map(card => ({
                label: card.title,
                value: card.id.toString()
            }));
            let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('card')
                    .setPlaceholder('Select a card')
                    .addOptions(cardOptions)
            )
            let catalogvas = await createCatalog(catalog.cards, catalog.background)
            collector?.stop()
            if (catalogvas == undefined) { row.components[0].setDisabled(true); await i.editReply({ content: "Catalog not found.", components:[row] }); return }
            let attachment = new AttachmentBuilder(catalogvas?.toBuffer(), { name: 'catalog.png' })
            await interaction.editReply({ components: [row], files: [attachment], content: null })
            let cardCollector = i.channel?.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60000, filter: m => m.message.id == message.id })
            cardCollector?.on('collect', async i => {
                await i.deferReply({ ephemeral: true })
                let card = cards.find(c => c.id.toString() == i.values[0])
                if (!card) { await i.editReply({ content: "Card not found." }); return }
                let cardFrame = await addFrame(GetFile.assets + `/images/tradecards/backgrounds/${card.background}`, card.rank, 1)
                let attachment = new AttachmentBuilder(cardFrame?.toBuffer(), { name: 'card.png' })
                let embed = new EmbedBuilder()
                    .setTitle(card.title)
                    .setImage('attachment://card.png')
                    .setDescription(card.description)
                await i.editReply({ embeds: [embed], files: [attachment] })
                setTimeout(() => {
                    i.deleteReply()
                }, 20000);
            })
        })
        return true;
    }
}