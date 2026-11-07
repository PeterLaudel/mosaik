//load environment
import "./inspector-polyfill";
import path from "path";
import fs from "fs";
import * as dotenv from "dotenv";
import 'pdfkit'; // ensure pdfkit is included in the bundle
//start next.js server
import next from "next";
import * as http from "http";
import { dbMigrate } from "./tasks/dbMigrate";

// Keeps the pre-rename folder name: installed apps store the patient database and .env here
const homeDir = path.join(
  process.env.HOME || "",
  "Library",
  "Application Support",
  "psychotherapie-seliger"
);

// create directory if it doesn't exist
if (!fs.existsSync(homeDir)) {
  fs.mkdirSync(homeDir, { recursive: true });
}

dotenv.config({ path: path.join(homeDir, ".env"), quiet: true });
process.env.SQLITE_URL = path.join(homeDir, "psychotherapie_seliger.sqlite");


void (async () => {
  await dbMigrate();

  const dev = false; // we always run production mode
  const app = next({ dev, dir: __dirname });
  const handle = app.getRequestHandler();

  await app.prepare();
  http
    .createServer((req, res) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handle(req, res);
    })
    .listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log("🚀 Next.js server running on http://localhost:3000");
    });
})();
