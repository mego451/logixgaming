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
  } finally {
    client.close();
  }
}

async function downloadPlayerCountAndUpdateChannel(channelId, retries = 3) {
  let playerCount = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const ftpClient = new ftp.Client();
    ftpClient.ftp.verbose = false;

    try {
      await ftpClient.access({
        host: "78.47.204.80",
        user: "lgserver",
        password: "20012155m",
        secure: false,
      });

      const remotePath = "/mods/deathmatch/resources/[In-Server]/mg_Discord/playercount.json";
      await ftpClient.downloadTo(PLAYER_COUNT_FILE, remotePath);
      console.log("✅ playercount.json file downloaded successfully!");

      if (fs.existsSync(PLAYER_COUNT_FILE)) {
        const data = fs.readFileSync(PLAYER_COUNT_FILE, 'utf-8');
        console.log("📂 Contents of playercount.json:", data);

        const jsonData = JSON.parse(data);
        const playerCountObj = Array.isArray(jsonData) ? jsonData[0] : jsonData;
        playerCount = playerCountObj?.playerCount ?? null;

        console.log("🟢 Player count:", playerCount);
      }

      break;
    } catch (err) {
      console.error(`❌ Error downloading player count (attempt ${attempt}): ${err.message}`);
      if (attempt < retries) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } finally {
      ftpClient.close();
    }
  }

  if (playerCount !== null) {
    const channel = client.channels.cache.get(channelId);
    if (channel) {
      try {
        await channel.setName(`🟢 Players: ${playerCount}`);
        console.log("✅ Channel name updated.");
      } catch (err) {
        console.error("❌ Failed to update channel name:", err.message);
      }
    }
  }
}

client.on("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

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

  setInterval(() => downloadPlayerCountAndUpdateChannel("1364623636509626420"), 60000);

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
  }, 60000);
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
