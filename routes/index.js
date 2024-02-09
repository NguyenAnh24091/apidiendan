var express = require('express');
var router = express.Router();
const schedule = require('node-schedule');
const admin = require('firebase-admin');

// Đường dẫn đến tệp tin dịch vụ Firebase
const serviceAccount = require('./serviceAccountKey.json');

// Khởi tạo ứng dụng Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://diendanbao-default-rtdb.firebaseio.com" // Thay đổi URL cơ sở dữ liệu Firebase của bạn
});

// Hàm gửi thông báo
async function sendNotification(tokens, title, body) {
  try {
    // Tạo thông báo
    const message = {
      notification: {
        title: title,
        body: body
      },
      tokens: tokens // Sử dụng tokens thay vì token để gửi thông báo đến nhiều thiết bị
    };

    // Gửi thông báo
    const response = await admin.messaging().sendMulticast(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Lấy tất cả token từ Firebase Realtime Database
async function getAllTokens() {
  try {
    const snapshot = await admin.database().ref('AndroidToken').once('value');
    const tokens = [];
    snapshot.forEach((childSnapshot) => {
      const token = childSnapshot.val(); // Lấy token từ snapshot
      tokens.push(token);
    });
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    return [];
  }
}

// Lập lịch gửi thông báo vào thời điểm cụ thể 
schedule.scheduleJob('20 16 * * *', async function() {
  // Lấy danh sách tất cả các token
  const tokens = await getAllTokens();
  // Gọi hàm gửi thông báo với danh sách tokens đã lấy được
  sendNotification(tokens, 'Diễn đàn xổ số', 'Xổ số miền nam');
});

schedule.scheduleJob('15 17 * * *', async function() {
  // Lấy danh sách tất cả các token
  const tokens = await getAllTokens();
  // Gọi hàm gữi thông báo với danh sách tokens được lắt
  sendNotification(tokens, 'Diễn đàn xổ số', 'Xổ số miền Trung');
})

schedule.scheduleJob('15 18 * * *', async function() {
  // Lấy danh sách tất cả các token
  const tokens = await getAllTokens();
  // Gọi hàm gữi thông báo với danh sách tokens là với
  sendNotification(tokens, 'Diễn đàn xổ số', 'Xổ số miền Bắc');
})

module.exports = router;
