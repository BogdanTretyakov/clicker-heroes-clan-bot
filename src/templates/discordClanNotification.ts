import { userMention } from "discord.js"
import { MAX_CLICKER_HEROES_INACTIVE } from "../constants/clickerHeroes"

interface TemplateUser {
  nickname: string,
  discordId?: string
}

type Props = Record<'active'|'nonActive'|'kickList', TemplateUser[]>

export const discordClanNotification = ({ active, nonActive, kickList }: Props) => {
  const [
    activeFormatted,
    nonActiveFormatted,
    kickListFormatted
  ] = [active, nonActive, kickList].map((type, idx) => !!type.length
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
    output += `\n\n**These guys were nonactive more, than ${MAX_CLICKER_HEROES_INACTIVE} days**`
    output += '\n**Kick them!**\n'
    output += kickListFormatted
  }
  return output
}
