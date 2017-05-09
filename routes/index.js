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




router.post('/actions/uploadimages', function(req, res) {
  readStream(["image"],req,function(err,stream){

    var formData = {};

    formData[stream.tag]={
      value:stream.file,
      options: {
        filename: stream.filename,
        knownLength: stream.byteCount,
        contentType: stream.contentType
      }
    };

    var options ={
      url: uploadMsUrl + "/file",
      method: "POST",
      formData:formData,
      preambleCRLF: true,
      postambleCRLF: true
    };

    request.post(options,function(err,response,body){
      if(err)
        return res.status(500).send({error_code:500, error:"Internalerror", error_message:err});
      res.status(201).send(JSON.parse(body));
    });

  });
});




function readStream(allowedMime,req,callback){

  var form = new multiparty.Form();

  form.on('error', function(err){
    return callback({error:"InternalError", error_code:err.statusCode, error_message:err},null);
  });

  form.on('part', function(part){

    console.log(JSON.stringify(part));

    if(part.filename){
      if(allowedMime == undefined){
        return callback(null,{tag:part.name, file:part, filename: part.filename, byteCount:part.byteCount,contentType:part.headers['content-type']});
      }else{
        console.log("im Before MAGIC");
        magic(part, function (err, mime, output){ //get mime
          console.log("im in MAGIC");
          if (err) return callback({error:"InternalError", error_code:500, error_message:err},null);
          var allowed = false;

          for(var i in allowedMime){
            if(allowedMime[i].indexOf("/") > -1){
              // check if strings are equals (ignore case)
              var re = new RegExp("^" + allowedMime[i] + "$", "i");
              if(re.test(mime.type)){
                allowed = true;
                break;
              }
            }else{
              // check if  mime.type starts with allowedMime[i] (ignore case)
              // fastest method
              var re = new RegExp("^" + allowedMime[i], "i");
              if(re.test(mime.type)){
                allowed = true;
                break;
              }
            }
          }

          if(allowed){
            return callback(null,{tag:part.name, file:output, filename:  part.filename, byteCount:part.byteCount,contentType:part.headers['content-type']});
          }else{
            return callback({error:"BadRequest", error_code:400, error_message:"Mime type " + mime.type + " is not allowed"},null);
          }
        });
      }

    }
  });
  form.parse(req);

};



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
