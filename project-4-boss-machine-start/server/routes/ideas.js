const ideasRouter = require('express').Router();
const {
    createMeeting,
    getAllFromDatabase,
    getFromDatabaseById,
    addToDatabase,
    updateInstanceInDatabase,
    deleteFromDatabasebyId,
    deleteAllFromDatabase,
} = require('../db');

const checkMillionDollarIdea = require('../checkMillionDollarIdea');

ideasRouter.get('/', (req, res, next) => {
    res.send(getAllFromDatabase('ideas'));
});

ideasRouter.post('/', checkMillionDollarIdea, (req, res, next) => {
    const added = addToDatabase('ideas', req.body);
    res.status(201).send(added);
});

ideasRouter.param('ideaId', (req, res, next, id) => {
    const idea = getFromDatabaseById('ideas', id);

    if(idea) {
        req.idea = idea;
        next();
    } else {
        res.status(404).send('Idea not found');
    }
});

ideasRouter.get('/:ideaId', (req, res, _) => {
    res.send(req.idea);
});

ideasRouter.put('/:ideaId', checkMillionDollarIdea, (req, res, _) => {
    const updated = updateInstanceInDatabase('ideas', req.body);
    res.send(updated);
});

ideasRouter.delete('/:ideaId', (req, res, _) => {
    deleteFromDatabasebyId('ideas', req.idea.id);
    res.send(204).send();
});

module.exports = ideasRouter;