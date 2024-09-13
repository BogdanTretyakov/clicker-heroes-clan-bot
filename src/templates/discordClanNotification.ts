import { userMention } from "discord.js"

export interface TemplateUser {
  nickname: string,
  discordId?: string
}

type Props = Record<'active'|'nonActive'|'kickList'|'kicked', TemplateUser[]>

export const discordClanNotification = ({ active, nonActive, kickList, kicked }: Props) => {
  const [
    activeFormatted,
    nonActiveFormatted,
    kickListFormatted,
    kickedFormatted
  ] = [active, nonActive, kickList, kicked].map((type, idx) => !!type.length
      ? type.map(({ nickname, discordId }) => {
        let output = `- ${nickname}`
        if (idx && discordId) {
          output += ` ${userMention(discordId)}`
        }
        return output
      }).join('\n')
      : ''
  )

  let output = ''
  if (activeFormatted.length) {
    output += `**Active members:**\n`
    output += activeFormatted
  }
  if (nonActiveFormatted.length) {
    output += `\n\n**Non active members:**\n`
    output += nonActiveFormatted
  }
  if (kickListFormatted.length) {
    output += `\n\n**These guys were nonactive**`
    output += '\n**Kick them!**\n'
    output += kickListFormatted
  }
  if (kickedFormatted.length) {
    output += `\n\n**These guys were nonactive**`
    output += '\n**And were be kicked from clan**\n'
    output += kickedFormatted
  }
  return output
}
