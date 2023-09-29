import * as fs from 'fs';

export default function checkExistFolder(path: string) {
  !fs.existsSync(path) && fs.mkdir(path, (err) => err);
}
