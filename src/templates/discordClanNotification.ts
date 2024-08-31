interface Props {
  active: string[]
  nonActive: string[]
}

export const discordClanNotification = ({ active, nonActive }: Props) => {
  const [
    activeFormatted,
    nonActiveFormatted
  ] = [active, nonActive].map(type => !type.length
      ? ''
      : type.map(name => `- ${name}`).join('\n')
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
  return output
}
