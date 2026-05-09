import app from "./app.js";
import { connectDB } from "./libs/db.js";
import { startExpireBookingsJob } from "./jobs/expireBookings.js";

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  startExpireBookingsJob();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API Docs:  http://localhost:${PORT}/api-docs`);
  });
});
