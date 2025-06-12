import "dotenv/config";
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express, { Express } from "express";
import popularRoutes from "./routes/homeDataRoutes";
import threadRoutes from "./routes/threadRoutes";
import detailsRoutes from "./routes/detailsRoutes";
import searchRoutes from "./routes/searchRoute";
import sitemapRoutes from "./routes/sitemapRoutes";
import { authenticate } from "./middlewares/authenticate";
import { corsOptions } from "./config/cors-config";
import errorHandler from './middlewares/handleError'
import authRoutes from './routes/authRoutes'
import metadataRoutes from './routes/metadataRoutes'
const app: Express = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors(corsOptions));

// auth routes
app.use("/api/auth",authRoutes);

app.use(authenticate);
// collection routes
app.use("/api/collection", popularRoutes);
app.use("/api/collection/threads", threadRoutes);
app.use("/api/collection/details", detailsRoutes);
app.use("/api/collection/search", searchRoutes);
app.use("/api/collection/metadata",metadataRoutes);

// sitemap routes
app.use("/api/sitemap", sitemapRoutes);

app.use(errorHandler);

app.listen(PORT, (err: Error | undefined) => {
  if (err) {
    console.log("Error while running server - ", err);
    process.exit(1);
  } else {
    console.log("Server started successfully at port - ", PORT);
  }
});
