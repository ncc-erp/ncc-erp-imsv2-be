import { pipeline } from 'stream';
import { promisify } from 'util';
import * as zlib from 'zlib';
import * as fs from 'fs';

const pipelineAsync = promisify(pipeline);

async function zipAndSave(data: string, filename: string): Promise<void> {
  const gzip = zlib.createGzip();
  const output = fs.createWriteStream(filename);

  const pipelinePromise = pipelineAsync(gzip, output);

  return new Promise<void>((resolve, reject) => {
    gzip.write(data);
    gzip.end();

    pipelinePromise.then(() => resolve()).catch((err) => reject(err));
  });
}

export { zipAndSave };
