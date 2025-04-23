const { Client, GatewayIntentBits, ActivityType, AttachmentBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const ftp = require("basic-ftp");
require('./clear.js');

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = "1363168636914630794";
const FILE_PATH = path.join(__dirname, "discord-to-mta.json");
const PLAYER_COUNT_FILE = path.join(__dirname, 'playercount.json');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
});

const ftpClient = new ftp.Client();
ftpClient.ftp.verbose = false;

async function connectFTP() {
  try {
    await ftpClient.access({
      host: "78.47.204.80",
      user: "lgserver",
      password: "20012155m",
      secure: false,
    });
    console.log("✅ FTP connected.");
  } catch (err) {
    console.error("❌ FTP connection error:", err.message);
    throw err; // رمي الخطأ لإيقاف الكود في حال فشل الاتصال
  }
}

async function uploadFileToFTP(localPath, remotePath) {
  try {
    await ftpClient.uploadFrom(localPath, remotePath);
    console.log("✅ File uploaded to FTP!");
  } catch (err) {
    console.error("❌ FTP Upload Error:", err.message);
  } finally {
    ftpClient.close(); // التأكد من إغلاق الاتصال بعد كل عملية رفع
  }
}

async function downloadPlayerCount(retries = 3) {
  let playerCount = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const remotePath = "/mods/deathmatch/resources/[In-Server]/mg_Discord/playercount.json"; // المسار الجديد في سيرفر MTA
      await ftpClient.downloadTo(PLAYER_COUNT_FILE, remotePath);
      console.log("✅ playercount.json file downloaded successfully!");

      // قراءة البيانات من الملف المحمل
      if (fs.existsSync(PLAYER_COUNT_FILE)) {
        const data = fs.readFileSync(PLAYER_COUNT_FILE, 'utf-8');
        console.log("📂 Contents of playercount.json:", data); // طباعة محتويات الملف للتأكد

        const jsonData = JSON.parse(data); // تحويل البيانات إلى كائن جافا سكربت
        const playerCountObj = jsonData[0]; // الحصول على الكائن الأول من المصفوفة
        playerCount = playerCountObj ? playerCountObj.playerCount : null; // استخراج playerCount

        console.log("🟢 Player count:", playerCount); // طباعة قيمة playerCount
      }

      break; // إذا نجحت العملية، اخرج من الحلقة
    } catch (err) {
      console.error(`❌ Error downloading player count (attempt ${attempt}): ${err.message}`);
      if (attempt < retries) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // الانتظار 5 ثواني قبل المحاولة التالية
      } else {
        console.error("❌ Maximum retry attempts reached.");
      }
    } finally {
      ftpClient.close(); // التأكد من إغلاق الاتصال بعد كل عملية تحميل
    }
  }

  return playerCount;
}

client.on("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // الاتصال بـ FTP عند بدء البوت
  await connectFTP();

  const guild = await client.guilds.fetch("1362391776391856229").catch(console.error);
  if (!guild) {
    console.error("❌ السيرفر مش موجود أو حصلت مشكلة في جلبه.");
    return;
  }

  const memberChannel = guild.channels.cache.get("1364623636509626420");
  if (!memberChannel) {
    console.error("❌ القناة مش موجودة أو مش متاحة.");
    return;
  }

  const CHANNEL_ID_TO_UPDATE = "1364623636509626420"; // ID القناة اللي هيتغير اسمها

  // دالة لتحديث اسم القناة
  async function updatePlayerCountChannelName() {
    const playerCount = await downloadPlayerCount();
    if (playerCount === null) return;

    const channel = client.channels.cache.get(CHANNEL_ID_TO_UPDATE);
    if (channel) {
      await channel.setName(`🟢 Players: ${playerCount}`);
      console.log("✅ Channel name updated.");
    }
  }

  // تحديث اسم القناة كل دقيقة
  setInterval(updatePlayerCountChannelName, 1000); // كل دقيقة

  // حالات البوت
  const statuses = [
    { name: 'MTA: LogiXGaming Roleplay', type: ActivityType.Playing },
    { name: 'Sarah Jay P*rn', type: ActivityType.Watching },
    { name: "Mando's Mom Showering", type: ActivityType.Watching },
    { name: 'Essam Sasa E7na so7ab baladna', type: ActivityType.Listening }
  ];

  let i = 0;
  setInterval(() => {
    const status = statuses[i % statuses.length];
    client.user.setPresence({
      activities: [{ name: status.name, type: status.type }],
      status: 'dnd',
    });
    i++;
  }, 60000); // تحديث الحالة كل دقيقة
});

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
  await uploadFileToFTP(FILE_PATH, "/mods/deathmatch/resources/[In-Server]/mg_Discord/discord-to-mta.json");
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get('1363168615691452727');
  if (!channel) return;

  const attachment = new AttachmentBuilder('./welcome.jpeg');

  const embed = new EmbedBuilder()
    .setImage('attachment://welcome.jpeg')
    .setColor('#00bfff');

  const welcomeMessage = `👋 Hello ${member.user.username} and welcome to **LogiXGaming** Discord Server!\nYou are member number **${member.guild.memberCount}** – enjoy your stay!`;

  channel.send({ content: welcomeMessage, embeds: [embed], files: [attachment] });
});

client.login(DISCORD_TOKEN);
