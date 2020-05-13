const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');
const apiRouter = require('./api/api');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api', apiRouter);

app.use(errorHandler())

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
});

module.exports = app;