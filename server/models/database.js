'use strict';

const pg = require('pg');

const config = {
  host: 'localhost',
  port: 5432,
  database: 'todo',
  user: 'postgres',
  password: 'fJidCNPA1A'
};

const client = new pg.Client(config);

client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack);
  } else {
    console.log('connected');
  }
});

const query = client.query(
  'CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)'
);

query.on('end', () => { client.end(); });
