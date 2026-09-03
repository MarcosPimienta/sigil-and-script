// Copies shared/eventPhrasing.json into server/shared so the API build stays self-contained.
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
copyFileSync(join(root, 'shared', 'eventPhrasing.json'), join(root, 'server', 'shared', 'eventPhrasing.json'));
console.log('server/shared/eventPhrasing.json synced');
