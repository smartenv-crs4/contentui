var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');
var multiparty = require('multiparty');
var magic = require('stream-mmmagic');
var FormData = require('form-data');
var renderPage=require('./render');

let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');


router.get('/activities/favicon.ico', function(req, res, next) {return res.status(404).send();}); //WORKAROUND PROVVISORIO!!! TODO gestire meglio

//////DINO (from 08/2017; before was Albe)/////
router.get('/activities/new',       require("./activities").post);
router.get('/activities/admins',    require("./activities").admins); //TODO security middleware!!!!
router.get('/activities/:id/edit',  require("./activities").put);
router.get('/activities/:id',       require("./activities").get);

///////////////

/* TODO Search in POST perche' non cacheabile? */
//////DINO/////
router.get('/',         require('./search').render);
router.get('/search',   require('./search').search);
router.get('/likes',    require('./search').likes);


//Mobile UI
//TODO security middleware!!!!
router.get('/mobile/',      require('./mobile').list);
router.get('/mobile/form',  require('./mobile').form);
router.get('/mobile/promos',      require('./mobile').promos);
router.get('/mobile/activities',  require('./mobile').activities);
router.get('/mobile/promotypes',  require('./mobile').promotypes);
router.post('/mobile/save/:cid',  require('./mobile').save);
router.delete('/mobile/delete/:cid/:pid', require('./mobile').delete);
///////////////


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

