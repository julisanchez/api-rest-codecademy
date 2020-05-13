const express = require('express');
const sqlite3 = require('sqlite3');

const artistsRouter = express.Router();

const DATABASE = process.env.TEST_DATABASE || './database.sqlite';
const db = new sqlite3.Database(DATABASE);

artistsRouter.get('/', (_, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ artists: rows });
        }
    });
});

artistsRouter.param('artistId', (req, res, next, id) => {
    db.get('SELECT * FROM Artist WHERE id = $artistId', { $artistId: id }, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.artist = row;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

artistsRouter.get('/:artistId', (req, res, _) => {
    res.status(200).send({ artist: req.artist });
});

artistsRouter.post('/', (req, res, next) => {
    const artist = req.body.artist;

    if (artist.name && artist.dateOfBirth && artist.biography) {
        if (!artist.isCurrentlyEmployed) artist.isCurrentlyEmployed = 1;

        // Create new artist
        db.run(
            `
                INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)
                VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)
            `,
            {
                $name: artist.name,
                $dateOfBirth: artist.dateOfBirth,
                $biography: artist.biography,
                $isCurrentlyEmployed: artist.isCurrentlyEmployed
            },
            function (err) {
                if(err) {
                    next(err);
                } else {

                    // Send new artist back
                    db.get('SELECT * FROM Artist WHERE id = $id', {$id: this.lastID}, (_, result) => {
                        res.status(201).json({ artist: result});
                    });
                }
            }
        );
    } else {
        res.sendStatus(400);
    }
});

artistsRouter.put('/:artistId', (req, res, next) => {
    const artist = req.body.artist;

    if(artist.name && artist.dateOfBirth && artist.biography) {
        // Update artist
        db.run(
            `
                UPDATE Artist
                SET name = $name, date_of_birth = $dateOfBirth, biography = $biography,
                is_currently_employed = $isCurrentlyEmployed
                WHERE id = $id
            `,
            {
                $id: req.params.artistId,
                $name: artist.name,
                $dateOfBirth: artist.dateOfBirth,
                $biography: artist.biography,
                $isCurrentlyEmployed: artist.isCurrentlyEmployed
            },
            function (err) {
                if(err) {
                    next(err);
                } else {
                    // Send updated artist back
                    db.get('SELECT * FROM Artist WHERE id = $id', {$id: req.params.artistId}, (_, result) => {
                        res.status(200).json({ artist: result});
                    });
                }
            }
        );
    } else {
        res.sendStatus(400);
    }
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run('UPDATE Artist SET is_currently_employed = 0 WHERE id = $id',
    {$id: req.params.artistId},
    function(err) {
        if(err) {
            next(err);
        } else {
            // Send updated artist back
            db.get('SELECT * FROM Artist WHERE id = $id', {$id: req.params.artistId}, (_, result) => {
                res.status(200).json({ artist: result});
            });
        }
    });
});

module.exports = artistsRouter;