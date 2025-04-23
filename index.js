const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const ftp = require("basic-ftp");
require('./clear.js');  // ضيف الكود ده في آخر index.js




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
  { name: 'MTA: LogiXGaming Roleplay', type: ActivityType.Playing },
  { name: 'Sarah Jay P*rn', type: ActivityType.Watching },
  { name: "Mando's Mom Showering", type: ActivityType.Watching },
  { name: 'Essam Sasa E7na so7ab baladna', type: ActivityType.Listening }
];

client.once('ready', () => {
  console.log('بوت جاهز!');
  const { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get('1363168615691452727');
  if (!channel) return;

  // تحميل صورة الترحيب من مجلد البوت (لازم تكون الصورة في نفس مجلد السكربت أو تحدد المسار الصحيح)
  const attachment = new AttachmentBuilder('./welcome.jpeg');

  // إنشاء الـ Embed
  const embed = new EmbedBuilder()
    .setTitle(`👋 Welcome!`)
    .setDescription(`Hello ${member.user.username} and welcome to LogiXGaming Discord Server!\nYou are member number ${member.guild.memberCount}, enjoy your stay!`)
    .setImage('attachment://welcome.jpeg')
    .setColor('#00bfff');

  // إرسال الرسالة
  channel.send({ embeds: [embed], files: [attachment] });
});



  // تغيير النشاط كل 30 ثانية
  let i = 0;
  setInterval(() => {
    const status = statuses[i % statuses.length];
    client.user.setPresence({
      activities: [{ name: status.name, type: status.type }],
      status: 'dnd', // تغيير الحالة هنا (dnd, online, idle)
    });
    i++;
  }, 30 * 1000); // تحديث النشاط كل 30 ثانية
});
client.on('guildMemberAdd', member => {
  sendWelcomeImage(member);
});
// تسجيل الدخول للبوت
client.login(DISCORD_TOKEN);
