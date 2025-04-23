const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

module.exports = async function sendWelcomeImage(member) {
  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');

  // خلفية مخصصة (لينك لصورة خلفية ترحيب)
  const background = await loadImage('https://i.imgur.com/zvWTUVu.jpg');
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // نص الترحيب
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px sans-serif';
  ctx.fillText(`Welcome ${member.user.username}!`, 300, 100);
  ctx.fillText(`You are member #${member.guild.memberCount}`, 300, 140);

  // صورة الأفاتار
  const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png' }));
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 25, 25, 200, 200);

  // إرسال الصورة
  const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
  const channel = member.guild.systemChannel || member.guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(member.guild.members.me).has("SendMessages"));
  
  if (channel) {
    channel.send({ files: [attachment] });
  }
};
