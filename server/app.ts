import express from "express";
import morgan from "morgan";
import path from "path";

const app = express();

app.use(express.json());

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use(express.static(path.join(__dirname, "../frontend/public")));

app.use(morgan("dev"));

export default app;
