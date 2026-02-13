require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Khởi tạo Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Đường dẫn file config
const configPath = path.join(__dirname, 'config.json');

// Định nghĩa các slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('taoqr')
    .setDescription('Tạo mã QR thanh toán VietQR')
    .addStringOption(option =>
      option.setName('ten_khach_hang')
        .setDescription('Tên khách hàng')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('gia_tien')
        .setDescription('Giá tiền (VND)')
        .setRequired(true)
        .setMinValue(1000)),
  
  new SlashCommandBuilder()
    .setName('config')
    .setDescription('Quản lý cấu hình ngân hàng (chỉ Admin)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('xem')
        .setDescription('Xem cấu hình hiện tại'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('sua')
        .setDescription('Thay đổi thông tin ngân hàng')
        .addStringOption(option =>
          option.setName('bank_id')
            .setDescription('Mã ngân hàng (VD: 970422 cho MB Bank)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('so_tai_khoan')
            .setDescription('Số tài khoản')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('ten_chu_tai_khoan')
            .setDescription('Tên chủ tài khoản (viết hoa, không dấu)')
            .setRequired(true))),
  
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Hướng dẫn sử dụng bot')
].map(command => command.toJSON());

// Hàm đăng ký slash commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  try {
    console.log('🔄 Đang đăng ký slash commands...');
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    
    console.log('✅ Đã đăng ký slash commands thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi đăng ký commands:', error);
  }
}

// Đọc cấu hình
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Lỗi đọc file config:', error);
  }
  
  // Trả về config mặc định từ .env
  return {
    bankId: process.env.BANK_ID || '970422',
    accountNo: process.env.ACCOUNT_NO || '0793137155',
    accountName: process.env.ACCOUNT_NAME || 'TRAN PHAM MINH DUC'
  };
}

// Lưu cấu hình
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Lỗi lưu file config:', error);
    return false;
  }
}

// Hàm tạo URL QR code
function generateQR(accountNo, accountName, bankId, amount, description) {
  const template = 'compact';
  const url = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
  return url;
}

// Hàm format số tiền
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
}

// Sự kiện khi bot sẵn sàng
client.on('ready', async () => {
  console.log(`✅ Bot đã sẵn sàng! Đăng nhập với tài khoản: ${client.user.tag}`);
  await registerCommands();
  client.user.setActivity('Sử dụng /taoqr để tạo QR thanh toán');
});

// Xử lý slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // ========================
  // Lệnh /taoqr
  // ========================
  if (commandName === 'taoqr') {
    const customerName = interaction.options.getString('ten_khach_hang');
    const amount = interaction.options.getInteger('gia_tien');

    try {
      await interaction.deferReply();

      const config = loadConfig();
      const description = `Thanh toan ${customerName}`;
      const qrUrl = generateQR(
        config.accountNo,
        config.accountName,
        config.bankId,
        amount,
        description
      );

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('💳 Mã QR Thanh Toán')
        .setDescription(`**Khách hàng:** ${customerName}\n**Số tiền:** ${formatMoney(amount)}`)
        .addFields(
          { name: '🏦 Ngân hàng', value: 'MB Bank', inline: true },
          { name: '📱 Số tài khoản', value: config.accountNo, inline: true },
          { name: '👤 Chủ tài khoản', value: config.accountName, inline: false },
          { name: '📝 Nội dung', value: description, inline: false }
        )
        .setImage(qrUrl)
        .setFooter({ text: 'Quét mã QR để thanh toán' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Lỗi tạo QR:', error);
      await interaction.editReply('❌ Có lỗi xảy ra khi tạo mã QR. Vui lòng thử lại sau!');
    }
  }

  // ========================
  // Lệnh /config
  // ========================
  if (commandName === 'config') {
    // Kiểm tra quyền admin
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ 
        content: '❌ Bạn cần có quyền Administrator để sử dụng lệnh này!',
        ephemeral: true 
      });
    }

    const subcommand = interaction.options.getSubcommand();

    // Subcommand: xem
    if (subcommand === 'xem') {
      const config = loadConfig();
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('⚙️ Cấu Hình Hiện Tại')
        .addFields(
          { name: '🏦 Mã ngân hàng (Bank ID)', value: config.bankId, inline: true },
          { name: '📱 Số tài khoản', value: config.accountNo, inline: true },
          { name: '👤 Tên chủ tài khoản', value: config.accountName, inline: false }
        )
        .setDescription('**Cách thay đổi:**\nSử dụng lệnh `/config sua`')
        .setFooter({ text: 'Chỉ Admin mới có thể thay đổi cấu hình' });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Subcommand: sua
    if (subcommand === 'sua') {
      const newBankId = interaction.options.getString('bank_id');
      const newAccountNo = interaction.options.getString('so_tai_khoan');
      const newAccountName = interaction.options.getString('ten_chu_tai_khoan').toUpperCase();

      // Kiểm tra dữ liệu
      if (!/^\d+$/.test(newBankId)) {
        return interaction.reply({ 
          content: '❌ Mã ngân hàng không hợp lệ! Phải là số.',
          ephemeral: true 
        });
      }

      if (!/^\d+$/.test(newAccountNo)) {
        return interaction.reply({ 
          content: '❌ Số tài khoản không hợp lệ! Phải là số.',
          ephemeral: true 
        });
      }

      // Lưu config mới
      const newConfig = {
        bankId: newBankId,
        accountNo: newAccountNo,
        accountName: newAccountName
      };

      if (saveConfig(newConfig)) {
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Cập Nhật Thành Công')
          .addFields(
            { name: '🏦 Mã ngân hàng', value: newBankId, inline: true },
            { name: '📱 Số tài khoản', value: newAccountNo, inline: true },
            { name: '👤 Tên chủ tài khoản', value: newAccountName, inline: false }
          )
          .setFooter({ text: 'Cấu hình đã được lưu' });

        interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        interaction.reply({ 
          content: '❌ Có lỗi xảy ra khi lưu cấu hình!',
          ephemeral: true 
        });
      }
    }
  }

  // ========================
  // Lệnh /help
  // ========================
  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📖 Hướng Dẫn Sử Dụng Bot')
      .setDescription('Bot tạo mã QR thanh toán VietQR cho MB Bank')
      .addFields(
        { 
          name: '💳 /taoqr', 
          value: 'Tạo mã QR thanh toán\nNhập tên khách hàng và giá tiền',
          inline: false 
        },
        { 
          name: '⚙️ /config xem', 
          value: 'Xem cấu hình hiện tại (chỉ Admin)',
          inline: false 
        },
        { 
          name: '⚙️ /config sua', 
          value: 'Thay đổi thông tin ngân hàng (chỉ Admin)',
          inline: false 
        },
        { 
          name: '❓ /help', 
          value: 'Hiển thị hướng dẫn này',
          inline: false 
        }
      )
      .setFooter({ text: 'VietQR Bot - Tạo mã QR thanh toán nhanh chóng' });

    interaction.reply({ embeds: [embed] });
  }
});

// Đăng nhập bot
client.login(process.env.DISCORD_TOKEN);
