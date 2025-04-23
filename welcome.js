const { Events, AttachmentBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const welcomeChannel = member.guild.systemChannel; // أو استخدم ID لقناة معينة

    if (!welcomeChannel) return;

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

    // إرسال الرسالة
    await welcomeChannel.send({ embeds: [embed], files: [image] });
  },
};
