var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');
var multiparty = require('multiparty');
var magic = require('stream-mmmagic');

let USER_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVzZWQgZm8gbXMiLCJ0eXBlIjoiY29udGVudG1zIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxODAzMTM2MzQ2NDI0fQ.c6QQR4daG_kfvme6nd4FqFnoOEkF2ejBo99uXZLMaRs";


let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');


console.log("contentUrl : ", contentUrl);


/* TODO Search in POST perche' non cacheabile? */
//////DINO/////
router.get('/', require('./search.js').render);
router.get('/search',   require('./search').search);
router.get('/likes',    require('./search').likes);
///////////////


router.get('/activities/new', function(req, res, next) {
  request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, body) {
    if (error) console.log("ERRR " + error);
    console.log(body);
    body = JSON.parse(body);
    return res.render('form_activity', {
      activityBody: {},
      params: JSON.stringify(req.params),
      query: JSON.stringify(req.query),
      baseUrl:baseUrl,
      uploadUrl:uploadUrl,
      contentUrl:contentUrl,
      footer:body.footer.html,
      footerCss:body.footer.css,
      footerScript:body.footer.js,
      header:body.header.html,
      headerCss:body.header.css,
      headerScript:body.header.js});
  });
});


router.get('/activities/:id', function(req, res, next) {

  var activity_id = req.params.id;

  request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, body) {
    if (error) console.log("ERRR " + error);
    console.log(body);
    var commonBody = JSON.parse(body);

    console.log("\n\ncalling contents/ "+config.contentUrl+"/contents/"+activity_id);

    request.get(config.contentUrl+"contents/"+activity_id, function (error, response, body) {
      if (error) console.log("ERRR " + error);
      console.log("\n\nGET ACTIVITY: "+JSON.stringify(body));

      return res.render('view_activity', {
        activityBody: body,
        baseUrl: baseUrl,
        uploadUrl: uploadUrl,
        contentUrl: contentUrl,
        footer: commonBody.footer.html,
        footerCss: commonBody.footer.css,
        footerScript: commonBody.footer.js,
        header: commonBody.header.html,
        headerCss: commonBody.header.css,
        headerScript: commonBody.header.js
      });
    });
  });
});



router.get('/activities/:id/edit', function(req, res, next) {

  var activity_id = req.params.id;
  var action = req.params.action;

  console.log("action is "+action);

  request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, body) {
    if (error) console.log("ERRR " + error);
    console.log(body);
    var commonBody = JSON.parse(body);

    console.log("\n\ncalling contents/ "+config.contentsUrl+"/contents/"+activity_id);

    request.get(config.contentsUrl+"contents/"+activity_id, function (error, response, body) {
      if (error) console.log("ERRR " + error);
      console.log("\n\nGET ACTIVITY: "+JSON.stringify(body));
      console.log("\n\nREQ QUERY: "+JSON.stringify(req.query));

      return res.render('form_activity', {
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
        activityBody: body,
        baseUrl: baseUrl,
        uploadUrl:uploadUrl,
        contentUrl: contentUrl,
        footer: commonBody.footer.html,
        footerCss: commonBody.footer.css,
        footerScript: commonBody.footer.js,
        header: commonBody.header.html,
        headerCss: commonBody.header.css,
        headerScript: commonBody.header.js
      });
    });
  });
});


router.post('/actions/uploadimage', function(req, res) {

  console.log("calling /actions/uploadimage");

  readStream(["image"],req,function(err,stream){

    var formData = {};

    console.log("\n\n\ndopo formdata ");


    formData[stream.tag]={
      value:stream.file,
      options: {
        filename: stream.filename,
        knownLength: stream.byteCount,
        contentType: stream.contentType
      }
    };


    var options ={
      url: uploadUrl+"file?access_token="+USER_TOKEN,
      method: "POST",
      formData:formData,
      preambleCRLF: true,
      postambleCRLF: true
    };

    console.log("\n\n\n\n\n sending these options: ");
    console.log(options);


    request.post(options,function(err,response,body){
      console.log("body is: "+body);

      if(!JSON.parse(body).hasOwnProperty('filecode'))  // this is an upload error
        return res.status(500).send({error_code:body.statusCode, error:"Internalerror", error_message:body.message});

      res.status(201).send(JSON.parse(body));
    });

  });
});




function readStream(allowedMime,req,callback){

  var form = new multiparty.Form();

  console.log("dentro readstream");


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



// promotions
router.get('/activities/:id_content/promotions/new', function(req, res, next) {
  request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, body) {
    if (error) console.log("ERRR " + error);
    console.log(body);
    body = JSON.parse(body);
    return res.render('form_promotion', {
      activityBody: {},
      params: JSON.stringify(req.params),
      query: JSON.stringify(req.query),
      baseUrl:baseUrl,
      uploadmsUrl:uploadmsUrl,
      contentsUrl:contentsUrl,
      footer:body.footer.html,
      footerCss:body.footer.css,
      footerScript:body.footer.js,
      header:body.header.html,
      headerCss:body.header.css,
      headerScript:body.header.js});
  });
});


/* GET environment info page. */
router.get('/env', function(req, res) {
    var env;
    if (process.env['NODE_ENV'] === 'dev')
        env='dev';
    else
        env='production';

    res.status(200).send({env:env});
});


router.get('/activities/:aid/promotions/:pid', function(req, res, next) {


    var activity_id = req.params.aid;
    var promotion_id = req.params.pid;
    var access_token=req.query.access_token || null;

    //todo Da Rimuovere questo controllo, serve solo per debug
    if(activity_id==0000){
        activity_id="58bec16509a61e1db51bf9cb";
        promotion_id="58bb5a5746e0fba34e3d8ce4";
    }


    request.get(config.commonUIUrl+"/headerAndFooter", function (error, response, body) {
        if (error) console.log("ERRR " + error);
        console.log(body);
        var commonBody = JSON.parse(body);

        console.log("\n\ncalling contents/ "+config.contentUrl+"/contents/"+activity_id);


        return res.render('view_promotion', {
            access_token:access_token,
            commonUI:{
              footer: commonBody.footer.html,
              footerCss: commonBody.footer.css,
              footerScript: commonBody.footer.js,
              header: commonBody.header.html,
              headerCss: commonBody.header.css,
              headerScript: commonBody.header.js,
              languagemanager:config.languageManagerLibUrl
            },
            properties:{
                contentUIUrl:config.contentUIUrl ,
                commonUIUrl:config.commonUIUrl
            },
            contentID:activity_id,
            promotionID:promotion_id

        });

        // request.get(config.contentUrl+"contents/"+activity_id, function (error, response, body) {
        //     if (error) console.log("ERRR " + error);
        //     console.log("\n\nGET ACTIVITY: "+JSON.stringify(body));
        //
        //     return res.render('view_promotion', {
        //         promotion: body,
        //         baseUrl: baseUrl,
        //         uploadUrl: uploadUrl,
        //         contentUrl: contentUrl,
        //         footer: commonBody.footer.html,
        //         footerCss: commonBody.footer.css,
        //         footerScript: commonBody.footer.js,
        //         header: commonBody.header.html,
        //         headerCss: commonBody.header.css,
        //         headerScript: commonBody.header.js
        //     });
        // });
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
