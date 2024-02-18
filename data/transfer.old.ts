import fs from 'fs'
import path from 'path'
import data, { GuildMember, GuildMemberManager } from '../modules/data'
let oldData = JSON.parse(fs.readFileSync(path.join(__dirname, './oldData.json'), 'utf8'))
oldData.servers.forEach((server: any) => {
  let guild = data.registerGuild(server.id)
  server.users.forEach((user: any) => {
    let member = new GuildMember(user.id, guild.id)
    let manager = new GuildMemberManager(member)
    manager.setXP(user.xp)
    manager.userManager.addGems(user.gems)
    guild.members.push(member)
  })
})
data.write()