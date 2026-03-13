import express from "express";
import morgan from "morgan";
import path from "path";

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.use(morgan("dev"));

export default app;
