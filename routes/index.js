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
let commonUIUrl = config.commonUIUrl + (config.commonUIUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let scheduleUrl = config.scheduleUrl + (config.scheduleUrl.endsWith('/') ? '' : '/');


/* GET environment info page. */
router.get('/env', function(req, res) {
    var env;
    if (process.env['NODE_ENV'] === 'dev')
        env='dev';
    else
        env='production';

    res.status(200).send({env:env});
});



////////////////////////////////
// Page rendering routes only //
////////////////////////////////


router.use(function(req, res, next) {


    var model={
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        }
    };

    if(req.query.access_token && req.gatewayPage) {  // is a redirection from middleware with uuid
        next();
    }else if(req.query.access_token && !req.gatewayPage){  // is access_token from url and not from middleware.js
        model.access_token=req.query.access_token;
        res.render('gatewayPage',model);
    } else {  // if no access_token or valid uuid
        if(req.query && (req.query.default=='true' )) { // page of not logged user. after gatewayPage Test
            next();
        }
        else {  // notLogged User but gatewayPage test is need.
            model.access_token=null;
            res.render('gatewayPage',model);
        }
    }

});



//search page
router.get('/',         (req, res, next) => {
  let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;
  renderPage.renderPage(res, 'search', {
      baseUrl:baseUrl, 
      contentUrl:contentUrl, 
      scheduleUrl:scheduleUrl,
      access_token: access_token,
      properties:{
        contentUIUrl:config.contentUIUrl ,
        commonUIUrl:config.commonUIUrl
      },
  });
});


//new activity
router.get('/activities/new',       (req, res, next) => {
  let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;		
  return renderPage.renderPage(res, 'activities/activity', {
    activityBody: undefined,
    params: JSON.stringify(req.params),
    query: JSON.stringify(req.query),
    baseUrl:baseUrl,
    uploadUrl:uploadUrl,
    contentUrl:contentUrl,
    isNew: true,
    properties:{
      contentUIUrl:config.contentUIUrl ,
      commonUIUrl:config.commonUIUrl
    },
    access_token: access_token,
    contentAdminTypes: config.contentAdminTokenType
  });
});


// activity get content
router.get('/activities/:id',    (req, res, next) => {
    let activity_id = req.params.id;
    let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;
  				
    renderPage.renderPage(res, 'activities/activity', {
        activityBody: undefined,
        activityId: activity_id,
        params: JSON.stringify(req.params) || undefined,
        query: JSON.stringify(req.query) || undefined,
        baseUrl: baseUrl,
        uploadUrl: uploadUrl,
        contentUrl: contentUrl,
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        },
        access_token: access_token,
        contentAdminTypes: config.contentAdminTokenType
    })
});   



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





router.get('/activities/:aid/promotions/:pid', function(req, res, next) {


    var activity_id = req.params.aid;
    var promotion_id = req.params.pid;
    var access_token=req.query.access_token || (req.parseHasTagAsQuery && req.parseHasTagAsQuery.access_token) || null;



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