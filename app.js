var express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  ;

app.set('view engine', 'jade');
app.set('views', './views');
app.set('view cache', false);
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', require('./routes/index'));

app.listen(3000, function() {
  console.log('Magic happens on http://localhost:3000');
});
