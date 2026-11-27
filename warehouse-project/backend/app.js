require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/error");

const app = express();

function normalizeOrigin(origin) {
  return String(origin ?? "").trim().replace(/\/+$/, "");
}

const allowedOrigins = new Set([
  ...String(process.env.CLIENT_URL ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean),
  "http://localhost:5173",
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors({ ...corsOptions, preflightContinue: true }));
app.options(/.*/, cors(corsOptions));

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "Warehouse backend is running", data: null });
});
app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/warehouses", require("./routes/warehouses"));
app.use("/api/products", require("./routes/products"));
app.use("/api/stock", require("./routes/stock"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/supply", require("./routes/supply"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/upload", require("./routes/upload"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
