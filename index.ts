import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { handleError } from './helpers/errors';
import setupRoutes from './controllers';
import path from 'path';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 8000;

const corsOptions: cors.CorsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  maxAge: 3600,
};

app.use(cors(corsOptions));
app.use('/imageUser', express.static(path.join(__dirname, 'imageUser')));
app.use('/imagesOffers', express.static(path.join(__dirname, 'imagesOffers')));
app.use('/imageSport', express.static(path.join(__dirname, 'imageSport')));
app.use(express.json());
app.use(cookieParser());

setupRoutes(app);

app.use(handleError);

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
