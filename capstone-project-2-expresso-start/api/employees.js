const employeesRouter = require('express').Router();
const sqlite3 = require('sqlite3'); // !node-sqlite is best

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

employeesRouter.get('/', (_, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ employees: employees });
        }
    });
});

employeesRouter.post('/', (req, res, next) => {
    const employee = req.body.employee;

    if (employee.name && employee.position && employee.wage && employee.isCurrentEmployee) {
        const createEmployee = `INSERT INTO Employee (name, position, wage, is_current_employee)
        VALUES ($name, $position, $wage, $isCurrentEmployee)`;
        const values = {
            $name: employee.name,
            $position: employee.position,
            $wage: employee.wage,
            $isCurrentEmployee: employee.isCurrentEmployee
        };

        db.run(createEmployee, values, function (err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE id: ${this.lastID}`, (_, employee) => {
                    res.status(201).json({ employee: employee });
                });
            }
        });
    } else {
        res.sendStatus(400);
    }
});

employeesRouter.param('employeeId', (req, res, next, id) => {
    db.get('SELECT * FROM Employee WHERE id = $id', { $id: id }, (err, employee) => {
        if (err) {
            next(err);
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

employeesRouter.get('/:employeeId', (req, res, _) => {
    res.status(200).json({ employee: req.employee });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const employee = req.body.employee;

    if (employee.name && employee.position && employee.wage && employee.isCurrentEmployee) {
        const updateSql = `UPDATE Employee SET name = $name, position = $position,
        wage = $wage, is_current_employee = $isCurrentEmployee
        WHERE id = $id`;

        const values = {
            $id: req.params.employeeId,
            $name: employee.name,
            $position: employee.position,
            $wage: employee.wage,
            $isCurrentEmployee: employee.isCurrentEmployee
        };

        db.run(updateSql, values, function (err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (_, employee) => {
                    res.status(200).json({ employee: employee });
                });
            }
        });
    } else {
        res.sendStatus(400);
    }
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const deleteSql = `UPDATE Employee SET is_current_employee = 0 WHERE id: $id`;

    db.run(deleteSql, { $id: req.params.employeeId }, function (err) {
        if (err) {
            next(err);
        } else {
            res.sendStatus(200);
        }
    });
});

module.exports = employeesRouter;