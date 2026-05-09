import axios from "axios";

const BASE_URL = "http://localhost:8080/api";
const NUM_USERS = 100;
const REQS_PER_USER = 5;
const DURATION_MS = 60000; // 1 phút

async function runTest() {
  try {
    console.log(`🚀 KHỞI ĐỘNG LOAD TEST THỰC TẾ:`);
    console.log(`- Giả lập: ${NUM_USERS} người dùng khác nhau`);
    console.log(`- Mỗi người đặt: ${REQS_PER_USER} vé`);
    console.log(
      `- Tổng mục tiêu: ${NUM_USERS * REQS_PER_USER} requests trong 1 phút`,
    );

    //lấy thông tin Concert và loại vé
    const concertRes = await axios.get(`${BASE_URL}/concerts`);
    const concert = concertRes.data.concerts[0];
    if (!concert) throw new Error("Không có Concert ACTIVE nào.");

    const ticketRes = await axios.get(
      `${BASE_URL}/concerts/${concert._id}/ticket-types`,
    );
    const ticketType = ticketRes.data.ticketTypes[0];
    console.log(
      `- Đang test cho: ${concert.name} (Hạng vé: ${ticketType.name})`,
    );
    console.log(`- Số lượng vé ban đầu: ${ticketType.availableQuantity}`);

    //tạo và Đăng nhập hàng loạt 100 User
    console.log(`\n🔑 Đang chuẩn bị ${NUM_USERS} tài khoản...`);
    const tokens = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const email = `bot-${Date.now()}-${i}@melotix.test`;
      try {
        await axios.post(`${BASE_URL}/auth/register`, {
          email,
          password: "Password123",
          fullName: `Bot User ${i}`,
        });
        const login = await axios.post(`${BASE_URL}/auth/login`, {
          email,
          password: "Password123",
        });
        tokens.push(login.data.token);
        if (i % 20 === 0) process.stdout.write(".");
      } catch (err) {
        console.error(`Lỗi tạo user ${i}: ${err.message}`);
      }
    }
    console.log(`\n✅ Đã chuẩn bị xong ${tokens.length} tài khoản.`);

    let success = 0;
    let failed = 0;
    let totalProcessed = 0;
    const start = Date.now();

    // 3. Thực hiện bắn request từ các User khác nhau
    console.log("\n🔥 Bắt đầu đặt vé đồng loạt...");

    const totalRequests = tokens.length * REQS_PER_USER;
    const interval = DURATION_MS / totalRequests;

    for (let r = 0; r < REQS_PER_USER; r++) {
      for (let u = 0; u < tokens.length; u++) {
        const token = tokens[u];
        const requestIdx = r * tokens.length + u;

        setTimeout(async () => {
          try {
            await axios.post(
              `${BASE_URL}/bookings`,
              {
                concertId: concert._id,
                ticketTypeId: ticketType._id,
                quantity: 1,
                idempotencyKey: `load-test-multi-${u}-${r}-${Date.now()}`,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            success++;
          } catch (err) {
            failed++;
          }

          totalProcessed++;
          if (totalProcessed === totalRequests) {
            const end = Date.now();
            //sau khi xong, lấy lại số lượng vé để check
            const finalTicketRes = await axios.get(
              `${BASE_URL}/concerts/${concert._id}/ticket-types`,
            );
            const finalTicket = finalTicketRes.data.ticketTypes.find(
              (t) => t._id === ticketType._id,
            );

            console.log("\n📊 KẾT QUẢ LOAD TEST ĐA NGƯỜI DÙNG:");
            console.log(
              `- Tổng thời gian: ${((end - start) / 1000).toFixed(2)}s`,
            );
            console.log(`- Đặt vé thành công: ${success}`);
            console.log(`- Thất bại: ${failed}`);
            console.log(
              `- Số vé còn lại thực tế trong DB: ${finalTicket.availableQuantity}`,
            );
            console.log(
              `- Chênh lệch khớp: ${ticketType.availableQuantity - finalTicket.availableQuantity === success ? "✅ KHỚP TUYỆT ĐỐI" : "❌ SAI LỆCH"}`,
            );
          }
        }, requestIdx * interval);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi kịch bản:", err.message);
  }
}

runTest();
