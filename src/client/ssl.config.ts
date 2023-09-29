import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const cert = fs.readFileSync(
  path.join(__dirname, '..', '..', 'ssl', 'nccsoft.vn.cer'),
);
const key = fs.readFileSync(
  path.join(__dirname, '..', '..', 'ssl', 'nccsoft.vn.key'),
);

const ca = fs.readFileSync(path.join(__dirname, '..', '..', 'ssl', 'ca.cer'));
export const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  cert: cert,
  key: key,
  ca: ca,
});
