import "dotenv/config";
import {
    accessTokenStrategy,
    localStrategy,
    refreshTokenStrategy,
} from "@middleware/passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import helmet from "helmet";
import createHttpError from "http-errors";
import passport from "passport";
import routes from "./routes";

passport.use("local", localStrategy);
passport.use("refreshToken", refreshTokenStrategy);
passport.use("accessToken", accessTokenStrategy);

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

app.use(routes);

app.use((_req, _res, next) => next(createHttpError(404)));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const code = createHttpError.isHttpError(err) ? err.statusCode : 500;

    if (code >= 500) {
        console.error(err);
    }

    res.sendStatus(code);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
