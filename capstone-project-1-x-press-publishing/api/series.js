const express = require('express');
const sqlite3 = require('sqlite3');
const issuesRouter = require('./issues');

const seriesRouter = express.Router();

const DATABASE = process.env.TEST_DATABASE || './database.sqlite';
const db = new sqlite3.Database(DATABASE);

seriesRouter.get('/', (_, res, next) => {
    db.all('SELECT * FROM Series', (err, data) => {
        if(err) {
            next(err);
        } else {
            res.status(200).send({series: data});
        }
    })
});

seriesRouter.param('seriesId', (req, res, next, id) => {
    db.get('SELECT * FROM Series WHERE id = $id', {$id: id}, (err, data) => {
        if(err) {
            next(err);
        } else if (data) {
            req.series = data;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

seriesRouter.get('/:seriesId', (req, res, _) => {
    res.status(200).send({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const series = req.body.series;

    if(series.name && series.description) {

        // Create new series
        db.run(
            `
                INSERT INTO Series (name, description)
                VALUES ($name, $description)
            `,
            {
                $name: series.name,
                $description: series.description
            },
            function (err) {
                if(err) {
                    next(err);
                } else {

                    // Send new series back
                    db.get('SELECT * FROM Series WHERE id = $id', {$id: this.lastID}, (_, data) => {
                        res.status(201).send({series: data});
                    });
                }
            }
        )
    } else {
        res.sendStatus(400);
    }
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const series = req.body.series;

    if(series.name && series.description) {

        // Update series
        db.run(
        `
            UPDATE Series
            SET name = $name, description = $description
            WHERE id = $id
        `,
        {
            $id: req.params.seriesId,
            $name: series.name,
            $description: series.description
        },
        function(err) {
            if(err) {
                next(err);
            } else {

                // Send updated series back
                db.get('SELECT * FROM Series WHERE id = $id', {$id: req.params.seriesId},(_, data) => {
                    res.status(200).send({series: data});
                })
            }
        });
    } else {
        res.sendStatus(400);
    }
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.all('SELECT * FROM Issue WHERE series_id = $seriesId', {$seriesId: req.params.seriesId}, (err, data) => {
        if(err) next(err);
        if(data.length) res.sendStatus(400);
        else {
            db.run('DELETE FROM Series WHERE id = $seriesId', {$seriesId: req.params.seriesId}, function (err) {
                if(err) next(err);
                else res.sendStatus(204);
            });
        }
    });
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

module.exports = seriesRouter;