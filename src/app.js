import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use((req, res, next) => {
  next();
});

app.use(express.json({ limit: "2000kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routed
import userRoutes from "./routes/user.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tweets", tweetRoutes);
export { app };
