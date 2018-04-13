const dev =  {
  database: 'Documents', // Each connection can specify its own database
  host: 'localhost',     // The host against which queries will be run
  port: 8011,            // By default port 8000 accepts Client API requests
  user: 'admin',        // Our newly-created user with at least the rest-writer role
  password: 'admin',  // writer's password
  authType: 'BASIC'     // The default auth
};

// Another connection. Change the module.exports below to 
// use it without having to change consuming code.
const test =  {
  database: 'Documents',
  host: 'acceptance.example.com',
  port: 9116,
  user: 'app-writer',
  password: '********',
  authType: 'DIGEST'
};

const twitter =  {
  consumer_key: 'xxx',
  consumer_secret: 'xxx',
  access_token_key: 'xxx',
  access_token_secret: 'xxx'
};


module.exports = {
  connection: dev,       // Export the development connection
    twitterConnection: twitter
};

