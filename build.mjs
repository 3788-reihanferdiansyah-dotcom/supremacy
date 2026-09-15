import { cp, mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const apps = [
  { name: 'launcher', base: '/', destination: output },
  { name: 'ongoing', base: '/dashboards/ongoing/', destination: path.join(output, 'dashboards/ongoing') },
  { name: 'supernova', base: '/dashboards/supernova/', destination: path.join(output, 'dashboards/supernova') },
  { name: 'anomali', base: '/dashboards/anomali/', destination: path.join(output, 'dashboards/anomali') },
  { name: 'urgent-hub', base: '/dashboards/urgent-hub/', destination: path.join(output, 'dashboards/urgent-hub') },
  { name: 'level-star', base: '/dashboards/level-star/', destination: path.join(output, 'dashboards/level-star') },
  { name: 'attendance', base: '/dashboards/attendance/', destination: path.join(output, 'dashboards/attendance') }
];

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, npm_config_registry: 'https://registry.npmjs.org/' },
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const app of apps) {
  const directory = path.join(root, 'apps', app.name);
  console.log(`\nBuilding ${app.name} with base ${app.base}`);
  run('npm', ['ci'], directory);
  run('npm', ['run', 'build', '--', `--base=${app.base}`], directory);
  await mkdir(app.destination, { recursive: true });
  await cp(path.join(directory, 'dist'), app.destination, { recursive: true });
}

console.log(`\nSuite assembled at ${output}`);
