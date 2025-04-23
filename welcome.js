const { Events, AttachmentBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // تأكد من وجود القناة باستخدام ID الصحيح
    const welcomeChannel = member.guild.channels.cache.get('1363168615691452727');
    if (!welcomeChannel) {
      console.log('القناة غير موجودة!');
      return;
    }

    // إعداد صورة الترحيب من لينك خارجي
    const image = new AttachmentBuilder("https://i.imgur.com/ReNFzF5.jpeg", {
      name: "welcome.jpeg",
    });

    // إنشاء رسالة ترحيب
    const embed = new EmbedBuilder()
      .setTitle(`👋 Welcome!`)
      .setDescription(`Hello ${member.user.username} and welcome to LogiXGaming Discord Server!\nYou are member number ${member.guild.memberCount}, enjoy your stay!`)
      .setImage("attachment://welcome.jpeg")
      .setColor("#00bfff");

    try {
      // إرسال الرسالة
      await welcomeChannel.send({ embeds: [embed], files: [image] });
      console.log('تم إرسال الرسالة بنجاح');
    } catch (error) {
      console.error('حدث خطأ أثناء إرسال الرسالة:', error);
    }
  },
};
