const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const marklogic = require('marklogic');
const Twitter = require('twitter');

//MarkLogic Database Connection
var connection = require('./connection').connection;
var db = marklogic.createDatabaseClient(connection);
var qb = marklogic.queryBuilder;

//Twitter API Keys
var twitterConnection = require('./connection').twitterConnection
var client = new Twitter(twitterConnection);

//HTML Files
app.use(express.static(__dirname + '/View'));

//Bootstrap CSS and JS Files
app.use(express.static(__dirname + '/dist'));

//index.html
app.get('/',function(req,res){
  res.sendFile('index.html');
});

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use((req, res, next) => {
  console.log('Processing Request');
  next(); //always call next ro middleware cannot get to next function
});


const port = process.env.PORT || 3001;


//API routes
const router = express.Router();



app.use('/api', router);

//Keyword Search
router.get('/tweet/search/:searchTerm/:marker/:total', function(req, res, next){ 
  //db.documents.query(qb.where(qb.term(req.params.searchTerm)).orderBy(qb.sort('timestamp_ms','descending'))).result().then(documents => {
  //db.documents.query(qb.where(qb.parsedFrom(req.params.searchTerm)).orderBy(qb.sort('timestamp_ms','descending'))).result().then(documents => {
  //db.documents.query(qb.where(qb.parsedFrom(req.params.searchTerm))).orderBy(qb.sort('timestamp_ms','descending').slice(0,10)).results().then(documents => {
  
  var marker = parseInt(req.params.marker);
  var total = parseInt(req.params.total);

  db.documents.query(qb.where(qb.parsedFrom(req.params.searchTerm)).orderBy(qb.sort('timestamp_ms','descending')).slice(marker,total)).result(function (documents) {
      
      res.json(documents);
      
      }, function(error) {
        console.log(JSON.stringify(error, null, 2));
      });
  });

/*
db.documents.query(
  qb.where(
    qb.parsedFrom('cat AND dog')
  ).orderBy(qb.sort('descending')
  .slice(0,5)
)
*/



//Keyword Search Summary
router.get('/tweet/searchSum/:searchTerm', function(req, res, next){  
  db.documents.query(qb.where(qb.term(req.params.searchTerm)).withOptions({categories: 'none'}).slice(0,11)).result().then(documents => {
  //db.documents.query(qb.where(qb.term(req.params.searchTerm)).orderBy(qb.sort('timestamp_ms','descending'))).result().then(documents => {
  //db.documents.query(qb.where(qb.parsedFrom(req.params.searchTerm)).orderBy(qb.sort('timestamp_ms','descending')).slice(0,10)).result().then(documents => {
      res.json(documents);
      //res.render('tweet.html');
      //return next();
    }).catch((err) => console.log(err));
});

//Get Single Tweet
router.get('/tweet/:collection/:id', function(req, res, next){
  //res.send(req.params.id)
  db.documents.read({uris: '/tweet/'+req.params.collection+'/'+req.params.id}).result().then(documents => {
      res.send(documents);
      return next();
    }).catch((err) => console.log(err));
});

global.stream = {}

//Start Stream
router.get('/tweet/streamStart/:streamTerm', function(req, res, next){  
  var streamKeyword = req.params.streamTerm;
  stream = client.stream('statuses/filter', {track: streamKeyword});

  stream.on('data', function(event) {
    //  console.log(event && event.text);
    //console.log(event);
    //var item = event
    //console.log(event)
    db.documents.write(
        { extension: 'json',
          directory: '/tweet/'+streamKeyword+'/',
          content: event,
          contentType: 'application/json',
          collections: [streamKeyword]
        }
      )
    .result()
    .then(response => console.dir(JSON.stringify(response)))
    .catch(error => console.error(error));

    });
  });

//Stop Stream
router.get('/tweet/streamStop/:streamTerm', function(req, res, next){ 
  stream.destroy();
});

//Start server
app.listen(port);

console.log('Server listening on port ' + port);
