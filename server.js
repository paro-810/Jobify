import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';
import morgan from 'morgan';

// db and authenticateUser
import connectDB from './db/connect.js';

// routers
import authRouter from './routes/authRoutes.js';
import jobRouter from './routes/jobRoutes.js';

// middleware
import errorHandlerMiddleware from './middleware/error-handler.js';
import notFoundMiddleware from './middleware/not-found.js';
import authenticateUser from './middleware/auth.js';

if (process.env.NODE_ENV !== 'production') {
  console.log('MORGAN');
  app.use(morgan('dev'));
}

app.use(express.json()); // to make available all JSON data to all post requests

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobRouter);

app.all('*', notFoundMiddleware);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log('Connected to database jobify...');

    if (process.env.NODE_ENV === 'production') {
      const path = require('path');
      app.get('/', (req, res) => {
        app.use(express.static(path.resolve(__dirname, 'client', 'build')));
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }

    const server = app.listen(port, () => {
      console.log(`Server is listening on ${port}...`);
    });

    process.on('unhandledRejection', (err) => {
      console.log('UNCAUGHT REJECTION...');
      console.log(err);
      server.close(() => {
        process.exit(1);
      });
    });
    process.on('uncaughtException', (err) => {
      console.log('UNCAUGHT EXCEPTION...');
      console.log(err);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (err) {
    console.log(err);
  }
};

start();
