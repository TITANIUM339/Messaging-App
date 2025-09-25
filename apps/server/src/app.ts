import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
