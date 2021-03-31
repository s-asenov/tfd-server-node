import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import { ApiRoutes, IRouter } from "./routes/ApiRouter";
import TerrainRouter from "./routes/TerrainRouter";

dotenv.config();

const app = express();

app.use(express.json());

const apiRoutes: IRouter[] = [
  {
    prefix: "",
    router: TerrainRouter,
  },
];

//routes
app.use("/api/auth", authRouter);

app.use("/api", ApiRoutes(apiRoutes));

app.get("/", (req, res) => {
  res.send("Homepage");
});

//db connection
mongoose.connect(
  process.env.DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => {
    console.log("DB connected");
  }
);

//listen
app.listen(3080);
