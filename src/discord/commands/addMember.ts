import { PermissionFlagsBits, SlashCommandBuilder, userMention } from "discord.js";
import { DiscordCommand } from "../types";
import { ClanMember } from "../../db";
import { Op } from "sequelize";

const command = new SlashCommandBuilder()
  .setName('add')
  .setDescription('Register users\'s nickname')
  .addUserOption(option =>
    option
    .setName('user')
    .setDescription('Discord user name to join with Clicker Heroes')
    .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('nickname')
      .setDescription('User\'s nickname in Clicker Heroes')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setDMPermission(false)


const getUser = (nickname: string ) => ClanMember.findOne({
  where: {
    nickname: {
      [Op.eq]: nickname
    }
  }
})

export const addMember: DiscordCommand = {
  command,
  handler: async (interaction) => {
    const user = interaction.options.getUser('user')
    const nickname = interaction.options.getString('nickname')

    if (!user || !nickname) {
      throw new Error('No need data provided')
    }

    const chUser = await getUser(nickname)

    if (!chUser) {
      await interaction.reply({
        content: `No user **${nickname}** found in clan`,
        ephemeral: true,
      })
      return
    }

    chUser.discordId = user.id
    await chUser.save()

    await interaction.reply({
      content: `Added user ${userMention(user.id)} to clan member **${chUser.nickname}**`,
      ephemeral: true,
    })
  },
}