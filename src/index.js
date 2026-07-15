import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ...rest of existing imports below
const app = express();


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://do-code-frontend.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", submissionRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
};

start();