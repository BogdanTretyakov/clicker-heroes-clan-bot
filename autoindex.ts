import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

(
  await readdir(resolve(__dirname, 'src'), {
    withFileTypes: true,
    recursive: true,
  })
)
  .filter(({ name }) => name === '.autoindex')
  .reduce(async (acc, { parentPath }) => {
    await acc;
    await generate(parentPath);
  }, Promise.resolve());

async function generate(path: string) {
  const blackList = (
    await readFile(resolve(path, '.autoindex'), { encoding: 'utf-8' })
  )
    .split('\n')
    .map((i) => i.trim())
    .concat('.autoindex', 'index.ts');

  const content =
    (await readdir(path, { withFileTypes: true }))
      .filter(({ name }) => !blackList.includes(name))
      .map(({ name }) => `export * from './${name}'`)
      .join('\n') + '\n';

  await writeFile(resolve(path, 'index.ts'), content, { encoding: 'utf-8' });
}
