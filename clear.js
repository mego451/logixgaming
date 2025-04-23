const { Client, GatewayIntentBits } = require("discord.js");

// إعدادات البوت
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // أمر مسح الشات
  if (message.content.toLowerCase() === "!clear") {

    // تأكيد من صاحب الصلاحية
    if (message.member.permissions.has("MANAGE_MESSAGES")) {
      // مسح آخر 100 رسالة في القناة
      try {
        const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
        await message.channel.bulkDelete(fetchedMessages);
        console.log("✅ Messages cleared!");
        message.channel.send("✅ تم مسح الشات!").then((msg) => msg.delete({ timeout: 5000 }));
      } catch (error) {
        console.error("❌ Error while clearing messages:", error);
        message.channel.send("❌ حدث خطأ أثناء مسح الشات!").then((msg) => msg.delete({ timeout: 5000 }));
      }
    } else {
      message.channel.send("❌ ليس لديك صلاحية لمسح الرسائل!").then((msg) => msg.delete({ timeout: 5000 }));
    }
  }
});

client.login(DISCORD_TOKEN);
