'use strict';

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
  const results = [];
  
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
          console.log(result);
          
          // SQL Query > Select Data
          const query = client.query('SELECT * FROM items ORDER BY id ASC');
          
          // stream results back one row at a time
          query.on('row', (row) => {
            results.push(row);
          });
      
          // After all data has returned, close connection and return results.
          query.on('end', () => {
            release();
            return res.json(results);
          });
        }
    });
  });
});

router.get('/api/v1/todos', (req, res) => {
  // Get a postgres client from the connection pool
  pool.connect()
    .then(client => {

      client.query('SELECT * FROM items ORDER BY id ASC')
        .then(result => {
          console.log(`Retrieved ${result.rowCount} items from DB!`);

          client.release();
          res.json(result.rows);
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

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
