const express = require('express');
const app = express();
const userRouter = require('./routes/userRoutes');
const movieRouter = require('./routes/showRoutes')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/users', userRouter);
app.use('/movies', movieRouter);



module.exports = app;
