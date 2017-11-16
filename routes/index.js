var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');
var multiparty = require('multiparty');
var magic = require('stream-mmmagic');
var FormData = require('form-data');
var renderPage=require('./render');

//???????? ds RIMUOVERE ?????????
let USER_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoibXMiLCJpc3MiOiJub3QgdXNlZCBmbyBtcyIsImVtYWlsIjoibm90IHVzZWQgZm8gbXMiLCJ0eXBlIjoiY29udGVudG1zIiwiZW5hYmxlZCI6dHJ1ZSwiZXhwIjoxODAzMTM2MzQ2NDI0fQ.c6QQR4daG_kfvme6nd4FqFnoOEkF2ejBo99uXZLMaRs";


let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');

console.log("contentUrl : ", contentUrl);


router.get('/activities/favicon.ico', function(req, res, next) {return res.status(404).send();}); //WORKAROUND PROVVISORIO!!! TODO gestire meglio

//////DINO (from 08/2017; before was Albe)/////
router.get('/activities/new',       require("./activities").post);
//router.get('/activities/:id/',       require("./activities").get);
router.get('/activities/:id',       require("./activities").get);
router.get('/activities/:id/edit',  require("./activities").put);
///////////////

/* TODO Search in POST perche' non cacheabile? */
//////DINO/////
router.get('/',         require('./search').render);
router.get('/search',   require('./search').search);
router.get('/likes',    require('./search').likes);


//Mobile UI
router.get('/mobile/',      require('./mobile').list);
router.get('/mobile/form',  require('./mobile').form);

router.get('/mobile/promos',      require('./mobile').promos);
router.get('/mobile/activities',  require('./mobile').activities);
router.get('/mobile/promotypes',  require('./mobile').promotypes);
router.post('/mobile/save/:cid',  require('./mobile').save);
router.delete('/mobile/delete/:cid/:pid', require('./mobile').delete);
///////////////


router.post('/actions/uploadimage', function(req, res) {

    var formData = new FormData();
    console.log("XX")
    formData.pipe(req.body.formData)

    var options ={
        url: uploadUrl+"file?access_token="+USER_TOKEN,
        method: "POST",
        formData:formData,
        preambleCRLF: true,
        postambleCRLF: true
    };

    request.post(options, function(err,response,body) {
        console.log("XXX")
        console.log(err)
        console.log(body)
        if(!JSON.parse(body).hasOwnProperty('filecode'))  // this is an upload error
          return res.status(500).send({error_code:body.statusCode, error:"Internalerror", error_message:body.message});

        res.status(201).send(JSON.parse(body));
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
router.get('/activities/:aid/promotions/new', function(req, res, next) {
    var activity_id = req.params.aid;
    var access_token=req.query.access_token || null;

    renderPage.renderPage(res,'view_promotion',{
        access_token:access_token,
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        },
        contentID:activity_id,
        promotionID:null,
        isANewPromotion:true
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


    renderPage.renderPage(res,'view_promotion',{
        access_token:access_token,
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        },
        contentID:activity_id,
        promotionID:promotion_id,
        isANewPromotion:false
    });
});

module.exports = router;

