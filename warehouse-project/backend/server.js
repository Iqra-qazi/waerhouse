require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();
  app.listen(port, () => console.log(`Backend listening on port ${port}`));
}

if (require.main === module && !process.env.VERCEL) {
  start().catch((error) => {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  });
}

module.exports = app;
