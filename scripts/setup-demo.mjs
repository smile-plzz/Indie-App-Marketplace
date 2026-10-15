import fs from "node:fs";
import crypto from "node:crypto";

const content = "Sandbox download fixture. This is not an installer.\n";
fs.mkdirSync("storage/releases/demo", { recursive: true });
fs.writeFileSync("storage/releases/demo/sandbox-download.txt", content);
if (!fs.existsSync(".env.local")) {
  const password = crypto.randomBytes(12).toString("base64url");
  const env = fs.readFileSync(".env.example", "utf8")
    .replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${password}`)
    .replace(/^ADMIN_SESSION_SECRET=.*$/m, `ADMIN_SESSION_SECRET=${crypto.randomBytes(32).toString("hex")}`)
    .replace(/^DOWNLOAD_SECRET=.*$/m, `DOWNLOAD_SECRET=${crypto.randomBytes(32).toString("hex")}`);
  fs.writeFileSync(".env.local", env);
  console.log("Local demo ready. Your admin password is saved in .env.local. Run npm run dev, then open /admin.");
} else {
  console.log("Demo fixture created. Existing .env.local preserved.");
}
