import { SlashCommandBuilder } from "discord.js";
import { DiscordCommand } from "../types";
import { ClickerHeroesAccountEntity } from "../../models";
import { ClickerHeroesUser } from "../../clickerHeroes/ClickerHeroesUser";


const command = new SlashCommandBuilder()
  .setDMPermission(true)
  .setName('register')
  .setDescription('Register Clicker Heroes account in bot')
  .addStringOption(option =>
    option
      .setName('uid')
      .setDescription('Clicker Heroes uid')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('password_hash')
      .setDescription('Clicker Heroes passwordHash')
      .setRequired(true)
  )

export const addClickerHeroesUser: DiscordCommand = {
  command,
  async handler(interaction) {
    try {
      const uid = interaction.options.getString('uid', true)
      const passwordHash = interaction.options.getString('password_hash', true)

      let account = await ClickerHeroesAccountEntity.findOne({
        where: {
          uid
        }
      })

      if (account) {
        if (account.discordId !== interaction.user.id) {
          await interaction.reply({
            content: 'Somebody already register that account',
            ephemeral: true,
          })
          return
        }

        if (account.passwordHash !== passwordHash) {
          await ClickerHeroesUser.create(account)

          account.passwordHash = passwordHash
          await account.save()
          await interaction.reply({
            content: 'Password hash successfully updated'
          })
          return
        }

        await interaction.reply({
          content: 'You already register this account before, nothing to do here',
          ephemeral: true,
        })

        return
      }


      account = await ClickerHeroesAccountEntity.create({
        uid,
        passwordHash,
        discordId: interaction.user.id,

      })


      const user = await ClickerHeroesUser.create(account).catch((e) => {
        account.destroy({ hooks: false })
        throw e
      })

      await interaction.reply({
        content: `Account ${user.userName ?? uid} successfully registered`,
        ephemeral: true,
      })

      account.guildName = user.guildName
      account.save()

      return

    } catch (e) {
      await interaction.reply({
        content: 'There is some error with your registration. Looks like you use bad uid and/or passwordHash',
        ephemeral: true,
      })
    }
  }
}
