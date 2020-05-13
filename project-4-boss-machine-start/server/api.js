const express = require('express');
const apiRouter = express.Router();

const minionsRouter = require('./routes/minions');
apiRouter.use('/minions', minionsRouter);


const ideasRouter = require('./routes/ideas');
apiRouter.use('/ideas', ideasRouter);

const meetingsRouter = require('./routes/meetings');
apiRouter.use('/meetings', meetingsRouter);

module.exports = apiRouter;