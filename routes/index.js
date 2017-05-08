var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');

let baseUrl = config.contentuiProtocol + "://" + config.contentuiHost + ":" + config.contentuiPort 
          + ((config.contentuiApiGwBaseUrl && config.contentuiApiGwBaseUrl.length > 0) ? config.contentuiApiGwBaseUrl : '')
          + ((config.contentuiApiVersion && config.contentuiApiVersion.length > 0) ? "/" + config.contentuiApiVersion : '')
          + '/';

let contentsUrl = config.contentsUrl + (config.contentsUrl.endsWith('/') ? '' : '/'); 

router.get('/', function(req, res, next) {
  res.render('search', {baseUrl:baseUrl, contentsUrl:contentsUrl});
});


router.get('/form', function(req, res, next) {
  request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, body) {
    if(error)console.log("ERRR " + error);
    console.log(body);
    body=JSON.parse(body);
    return res.render('form_activity', {baseUrl:baseUrl, contentsUrl:contentsUrl, footer:body.footer.html,footerCss:body.footer.css,footerScript:body.footer.js,header:body.header.html,headerCss:body.header.css,headerScript:body.header.js});
  });
});


/* TODO Search in POST perche' non cacheabile? */
router.get('/search', function(req, res, next) {
  let text = req.query.q;
  let sdate = req.query.sdate;
  let edate = req.query.edate;

  let options = {
    method:'GET',
    uri:contentsUrl + 'contents?text=' + text + (sdate && edate ? "&sdate=" + sdate + "&edate=" + edate : ''), //TODO cercare promotion by default
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
