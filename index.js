const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const ftp = require("basic-ftp");

// إعدادات البوت
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = "1363168636914630794";
const FILE_PATH = path.join(__dirname, "discord-to-mta.json");

// دالة رفع الملف عبر FTP
async function uploadFileToFTP(localPath, remotePath) {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: "78.47.204.80",
      user: "lgserver",
      password: "20012155m",
      secure: false,
    });

    await client.uploadFrom(localPath, remotePath);
    console.log("✅ File uploaded to FTP!");
  } catch (err) {
    console.error("❌ FTP Upload Error:", err.message);
  }

  client.close();
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// إرسال الرسائل وتخزينها
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;

  const payload = {
    author: message.author.username,
    message: message.content,
    time: Date.now(),
  };

  fs.writeFileSync(FILE_PATH, JSON.stringify(payload, null, 2));
  console.log("✅ Message saved to file.");

  // رفع الملف على FTP بعد الكتابة
  await uploadFileToFTP(FILE_PATH, "/mods/deathmatch/resources/[In-Server]/mg_Discord/discord-to-mta.json");
});

const statuses = [
  { name: 'MTA: LogiXGaming Roleplay', type: 'PLAYING' },
  { name: 'P*rn', type: 'WATCHING' },
  { name: "Mando's Mom", type: 'WATCHING' },
  { name: 'Essam Sasa', type: 'LISTENING' }
];

client.once('ready', () => {
  console.log('بوت جاهز!');
  // تغيير النشاط كل دقيقة
  let i = 0;
  setInterval(() => {
    const status = statuses[i % statuses.length];
    client.user.setActivity(status.name, { type: status.type });
    i++;
  }, 30 * 1000); // تحديث النشاط كل 60 ثانية

  // تفعيل وضع DND
  client.user.setStatus('dnd');
});

// تسجيل الدخول للبوت
client.login(DISCORD_TOKEN);
