const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const configData = require('./config');
const nodemailer = require('nodemailer');
const cors = require('cors');

const { DB_HOST, DB_ME, DB_NAME, DB_PASS, PORT } = configData.envdata;
app.use(express.json());
app.use(cors());


const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
// increase the limit
myEmitter.setMaxListeners(100);
myEmitter.emit('event');

// var knex = require('knex') ({
//     client: 'mysql',
//     connection: {
//         filename: './todoBackend'
//     },
//     useNullAsDefault: true
// })

var knex = require('knex')({
  client: 'mysql',
  connection: {
      host: DB_HOST,
      user: DB_ME,
      database: DB_NAME,
      password: DB_PASS
  }
});

knex.schema.hasTable('user').then(function(exists) {
  if (!exists) {
    return knex.schema.createTable('user', function(t) {
      t.string('firstName');
      t.string('lastName')
      t.increments('userId').primary();
      t.string('email').unique();
      t.string('password');
    });
  }
});


knex.schema.hasTable('secret').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('secret', function(t) {
        t.integer('userId');
        t.increments('id').primary();
        t.string('item');
        t.boolean('done');
      });
    }
});


var todo = express.Router();
require('./Routes/first')(todo, knex, jwt);
app.use('/', todo);

var auth = express.Router();
require('./Routes/auth')(auth, knex, jwt);
app.use('/', auth);

var signup = express.Router();
require('./Routes/signup')(signup, knex, jwt);
app.use('/', signup);

var forgotPass = express.Router();
require('./Routes/forgotPass')(forgotPass, knex, nodemailer, jwt);
app.use('/', forgotPass);

var resetPass = express.Router();
require('./Routes/resetPass')(resetPass, knex, jwt);
app.use('/', resetPass);

var profile = express.Router();
require('./Routes/profile')(profile, knex, jwt);
app.use('/', profile);

app.listen(PORT, () => {
    console.log(`your app is listening at port ${PORT}`);
})