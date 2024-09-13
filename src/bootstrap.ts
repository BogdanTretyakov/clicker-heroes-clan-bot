import './environments.ts'
import './discord'
import './db/relations.ts'
import { sequelize } from './db/index.ts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

;[utc, timezone].forEach(plugin => dayjs.extend(plugin))
dayjs.tz.setDefault('Etc/GMT')

await sequelize.sync({ alter: true })
