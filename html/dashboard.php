<?php
// إعدادات FTP
$ftp_server = "78.47.204.80";
$ftp_user_name = "lgserver";
$ftp_user_pass = "20012155m";
$ftp_connection = ftp_connect($ftp_server) or die("لا يمكن الاتصال بالسيرفر");

// تسجيل الدخول
$login = ftp_login($ftp_connection, $ftp_user_name, $ftp_user_pass);
if ((!$ftp_connection) || (!$login)) {
    die("فشل الاتصال بـ FTP أو تسجيل الدخول");
}

// دالة لتحميل بيانات اللاعب من FTP
function getPlayerData($username) {
    global $ftp_connection;
    
    // مسار ملف بيانات اللاعب
    $file_path = "/mods/deathmatch/resources/[In-Server]/mg_Discord/data/users/$username.json";
    $local_file = tempnam(sys_get_temp_dir(), 'ftp_data'); // تحميل الملف مؤقتًا إلى جهاز السيرفر
    
    // تحميل الملف
    if (ftp_get($ftp_connection, $local_file, $file_path, FTP_BINARY)) {
        // قراءة البيانات من الملف المحلي
        $json_data = file_get_contents($local_file);
        $playerData = json_decode($json_data, true);
        
        // حذف الملف المحلي المؤقت
        unlink($local_file);
        
        return $playerData;
    } else {
        return null;
    }
}

// إعداد صفحة الدخول
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['username'])) {
    echo '
    <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تسجيل الدخول - سيرفر MTA</title>
        <style>
          body {
            font-family: Arial;
            background-color: #111;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .login-box {
            background: #222;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 15px #000;
          }
          input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: none;
            border-radius: 5px;
          }
          button {
            background: #4caf50;
            color: white;
            padding: 10px;
            border: none;
            border-radius: 5px;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="login-box">
          <h2>تسجيل الدخول</h2>
          <form action="" method="GET">
            <input type="text" name="username" placeholder="اسم المستخدم" required>
            <button type="submit">دخول</button>
          </form>
        </div>
      </body>
    </html>';
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['username'])) {
    $username = $_GET['username'];
    $playerData = getPlayerData($username);

    if (!$playerData) {
        echo "الحساب غير موجود.";
    } else {
        echo '
        <html lang="ar">
          <head>
            <meta charset="UTF-8">
            <title>لوحة تحكم - ' . htmlspecialchars($playerData['username']) . '</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #111;
                color: #fff;
                margin: 0;
                padding: 0;
              }
              .dashboard {
                background: #222;
                padding: 20px;
                border-radius: 10px;
                width: 80%;
                margin: 20px auto;
                box-shadow: 0 0 15px #000;
              }
              h2 {
                text-align: center;
              }
              .data-row {
                margin: 10px 0;
              }
              .label {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="dashboard">
              <h2>مرحباً، ' . htmlspecialchars($playerData['username']) . '</h2>
              <div class="data-row">
                <span class="label">الفلوس:</span> ' . htmlspecialchars($playerData['money']) . ' MEGOS
              </div>
              <div class="data-row">
                <span class="label">البنك:</span> ' . htmlspecialchars($playerData['bank']) . ' MEGOS
              </div>
              <div class="data-row">
                <span class="label">الخبرة (EXP):</span> ' . htmlspecialchars($playerData['exp']) . '
              </div>
              <div class="data-row">
                <span class="label">اللون المفضل:</span>
                <span style="color: rgb(' . htmlspecialchars($playerData['color']['r']) . ',' . htmlspecialchars($playerData['color']['g']) . ',' . htmlspecialchars($playerData['color']['b']) . ')">
                  (' . htmlspecialchars($playerData['color']['r']) . ',' . htmlspecialchars($playerData['color']['g']) . ',' . htmlspecialchars($playerData['color']['b']) . ')
                </span>
              </div>
              <div class="data-row">
                <span class="label">العربيات:</span>
                <ul>';
                foreach ($playerData['vehicles'] as $vehicle) {
                    echo '<li>' . htmlspecialchars($vehicle) . '</li>';
                }
                echo '</ul>
              </div>
            </div>
          </body>
        </html>';
    }
}

// غلق الاتصال بـ FTP
ftp_close($ftp_connection);
?>

