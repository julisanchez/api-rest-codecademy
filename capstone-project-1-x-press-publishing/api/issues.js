const express = require('express');
const sqlite3 = require('sqlite3');

const issuesRouter = express.Router({ mergeParams: true });

const DATABASE = process.env.TEST_DATABASE || './database.sqlite';
const db = new sqlite3.Database(DATABASE);

issuesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Issue WHERE series_id = $seriesId', { $seriesId: req.params.seriesId }, (err, data) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ issues: data });
        }
    });
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const artistSql = 'SELECT * FROM Artist WHERE id = $artistId';
    const artistValues = { $artistId: artistId };

    db.get(artistSql, artistValues, (err, artist) => {
        if (err) {
            next(err);
        } else {
            if (!name || !issueNumber || !publicationDate || !artist) {
                return res.sendStatus(400);
            }

            const sql = `INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)
            VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`;
            const values = {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $seriesId: req.params.seriesId
            };

            db.run(sql, values, function (err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`,
                    (_, issue) => {
                        res.status(201).json({ issue: issue });
                    });
                }
            });
        }
    });
});

issuesRouter.param('issueId', (req, res, next, id) => {
    db.get('SELECT * FROM Issue WHERE id = $issueId', { $issueId: id }, (err, data) => {
        if (err) { next(err); }
        else if (data) {
            req.issue = data;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const issue = req.body.issue;

    if (issue.name && issue.issueNumber && issue.publicationDate && issue.artistId) {
        db.get('SELECT * FROM Artist WHERE id = $artistId', { $artistId: issue.artistId }, (err, result) => {
            if (err) next(err);
            if (result) db.run(
                `
            UPDATE Issue
            SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate,
            artist_id = $artistId
            WHERE id = $id
            `,
                {
                    $id: req.params.issueId,
                    $name: issue.name,
                    $issueNumber: issue.issueNumber,
                    $publicationDate: issue.publicationDate,
                    $artistId: issue.artistId
                },
                function (err) {
                    if (err) { next(err); }
                    else {
                        db.get('SELECT * FROM Issue WHERE id = $issueId', { $issueId: req.params.issueId },
                            (_, data) => {
                                res.status(200).send({ issue: data });
                            });
                    }
                }
            );
            else res.sendStatus(400);
        });
    } else {
        res.sendStatus(400);
    }
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run('DELETE FROM Issue WHERE id = $issueId', { $issueId: req.params.issueId }, function (err) {
        if (err) { next(err); }
        else {
            res.sendStatus(204);
        }
    })
});

module.exports = issuesRouter;