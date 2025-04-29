import "dotenv/config";
import express from "express";
import cors    from "cors";
import {analyze} from "./routes/analyze"; // Adjusted the path to be relative to the current file


const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/analyze", analyze);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => console.log(`✨ FlowGen API listening on :${port}`));
