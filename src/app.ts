import './bootstrap.ts'
import cron from 'node-cron';
import * as tasks from './tasks'
import { createEachAccountRunner } from './tasks/utils.ts';

Object.entries(tasks).forEach(([name, task]) => {
  const { expression, runOnInit } = task
  const callback = 'handler' in task ? createEachAccountRunner(task.handler) : task.rawHandler
  cron.schedule(expression, callback, {
    name,
    timezone: 'Etc/GMT',
    runOnInit,
    recoverMissedExecutions: true,
    scheduled: true,
  })
  if (runOnInit) {
    callback('init');
  }
})
