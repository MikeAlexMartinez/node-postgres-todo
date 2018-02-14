'use strict';

const path = require('path');

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  database: 'todo',
  user: 'postgres',
  password: 'fJidCNPA1A',
  idleTimeoutMillis: 30000,
  connectionTimeoutMills: 3000
};

const pool = new Pool(config);

router.post('/api/v1/todos', (req, res) => {
  // Grab data from http request
  // Should validate data here
  const data = {text: req.body.text, complete: false};

  // Get a Postgres client from the connection pool
  pool.connect((err, client, release) => {
    // handle connection errors
    if (err) {
      release();
      console.error(err);
      return res.status(500).json({success: false, data: err});
    }
    
    // SQL Query > Insert Data
    client.query('INSERT INTO items(text, complete) values($1, $2)',
      [data.text, data.complete],
      // Check query executed successfully
      (err, result) => {
        if (err) {
          console.error(err);
          release();
          return res.status(500).json({success: false, data: err});
        } else {
          console.log(`Inserted ${result.rowCount} item(s) into DB!`);

          fetchAllFrom(client, 'items')
            .then(data => {
              res.json(data);
            })
            .catch(err => {
              console.log('Error retrieving data');
              console.error(err);
              res.status(500).json({success: false, data: err});
            });
        }
    });
  });
});

router.get('/api/v1/todos', (req, res) => {
  // Get a postgres client from the connection pool
  pool.connect()
    .then(client => {

      fetchAllFrom(client, 'items')
        .then(data => {
          res.json(data);
        })
        .catch(err => {
          console.log('Error retrieving data');
          console.error(err);
          res.status(500).json({success: false, data: err});
        });

    })
    .catch(err => {
      console.error(err);
      res.status(500).json({success: false, data: err});
    });
});

router.put('/api/v1/todos/:todoId', (req, res) => {
  // Get data from url
  const id = req.params.todoId;
  // Get data from http request
  const data = {text: req.body.text, complete: req.body.complete};
  // Get Postgres client from the connection pool
  pool.connect()
    .then(client => {

      // Update existing
      client.query('UPDATE items SET text=($1), complete=($2) WHERE id=($3)',
          [data.text, data.complete, id]
        )
        .then(result => {
          console.log(`${result.rowCount} item Updated. ${id} has now been updated!`);

          fetchAllFrom(client, 'items')
            .then(data => {
              res.json(data);
            })
            .catch(err => {
              console.log('Error retrieving data');
              console.error(err);
              res.status(500).json({success: false, data: err});
            });
        })
        .catch(err => {
          console.error(err);

          client.release();
          res.status(500).json({success: false, data: err});
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({success: false, data: err});
    });
});

router.delete('/api/v1/todos/:todoId', (req, res) => {
  // get data from URL params
  const id = req.params.todoId;

  pool.connect()
    .then(client => {

      client.query('DELETE FROM items WHERE id=($1)', [id])
        .then(result => {
          console.log(`Deleted ${result.rowCount} item(s) from DB!`);

          fetchAllFrom(client, 'items')
            .then(data => {
              res.json(data);
            })
            .catch(err => {
              console.log('Error retrieving data');
              console.error(err);
              res.status(500).json({success: false, data: err});
            });
        })
        .catch(err => {
          console.log('Error deleting resource');
          console.error(err);
          client.release();
          res.status(500).json({success: false, data: err});
        });


    })
    .catch(err => {
      console.log('Error retrieving client');
      console.error(err);
      res.status(500).json({success: false, data: err});
    });

});

/* GET home page. */
router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'views' ,'index.html'));
});

function fetchAllFrom(client, table) {
  return new Promise((res, rej) => {
    
    client.query(`SELECT * FROM ${table} ORDER BY id ASC`)
      .then(results => {
        console.log(`Retrieved ${results.rowCount} items form DB!`);

        client.release();
        res(results.rows);
      })
      .catch(err => {
        console.error(err);
        
        client.release();
        rej(err);
      });

  });
}

module.exports = router;
