var express = require('express');
var router = express.Router();
var rp = require('request-promise');

router.get('/', function(req, res, next) {
  res.render('search');
});


router.get('/form', function(req, res, next) {
  res.render('form_activity');
});


/* TODO Search in POST perche' non cacheabile? */
router.get('/search', function(req, res, next) {
  let text = req.query.q;
  let options = {
    method:'GET',
    uri:'http://localhost:3002/contents?text=' + text,
    json:true
  }
  rp(options)
  .then((results) => {
    res.json(results);
  })
  .catch((err) => {
    console.log(err);
  });
});


module.exports = router;

/*
config file per host ricerche

middleware auth

- GET visualizza la pagina di ricerca
  - pagina chiama POST che effettua la ricerca
    - POST forwarda al microservizio contentms
    - POST restituisce risultati a pagina di ricerca
  - pagina di ricerca aggiorna i contenuti dinamicamente

*/
