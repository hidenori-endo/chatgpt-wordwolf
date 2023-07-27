import express from "express";
const path = require("path");
import { getCompletion } from "./chatmain";

const app: express.Express = express();
app.use(express.json());
app.use(express.static("public"));
const port = 8000;

// POST 送信
app.post("/api", (req: express.Request, res: express.Response) => {
  const body = req.body;

  // chatmain
  try {
    getCompletion(body, res);
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`running at port ${port} `);
});
