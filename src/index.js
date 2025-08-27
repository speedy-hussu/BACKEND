import dotenv from "dotenv";
import connectDb from "./db/db.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
