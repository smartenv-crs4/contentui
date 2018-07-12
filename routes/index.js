var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');
var multiparty = require('multiparty');
var magic = require('stream-mmmagic');
var FormData = require('form-data');
var renderPage=require('./render');
var _=require('underscore');
var commonFunctions=require('./commonFunctions');
var async=require('async');


let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
let commonUIUrl = config.commonUIUrl + (config.commonUIUrl.endsWith('/') ? '' : '/');
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
let scheduleUrl = config.scheduleUrl + (config.scheduleUrl.endsWith('/') ? '' : '/');
let timezone = config.timezone || "Europe/Rome";

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
router.get('/',  (req, res, next) => {
  let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;
  renderPage.renderPage(res, 'search', {
      tz: timezone,
      baseUrl:baseUrl, 
      contentUrl:contentUrl, 
      scheduleUrl:scheduleUrl,
      uploadUrl:uploadUrl,
      access_token: access_token,
      contentAdminTypes: config.ApplicationTokenTypes.contentAdminTokenType,
      properties:{
        contentUIUrl:config.contentUIUrl ,
        commonUIUrl:config.commonUIUrl
      },
  });
});



// logout Page
router.get('/logoutapp', function(req, res, next) {
    renderPage.renderPage(res,'logoutPage',{
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        }
    });
});



// favourites
router.get('/favourites', function(req, res, next) {

    var access_token=req.query.access_token || (req.parseHasTagAsQuery && req.parseHasTagAsQuery.access_token) || null;

    renderPage.renderPage(res,'view_favourites',{
        access_token:access_token,
        tz: timezone,
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        }
    });
});


//new activity
router.get('/activities/new',       (req, res, next) => {
  let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;		
  return renderPage.renderPage(res, 'activities/activity', {
    activityBody: undefined,
    tz: timezone,
    params: JSON.stringify(req.params),
    query: JSON.stringify(req.query),
    baseUrl:baseUrl,
    uploadUrl:uploadUrl,
    maxImageSize:config.maxImageSize,
    userUiUrl:config.userUIUrl,
    contentUrl:contentUrl,
    isNew: true,
    properties:{
      contentUIUrl:config.contentUIUrl ,
      commonUIUrl:config.commonUIUrl
    },
    access_token: access_token,
    contentAdminTypes: config.ApplicationTokenTypes.contentAdminTokenType
  });
});


// activity get content
router.get('/activities/:id',    (req, res, next) => {
    let activity_id = req.params.id;
    let access_token = req.query.access_token || null; //SOSTITUIRE CON req.headers.authorization.split(' ')[1] || null;
  				
    renderPage.renderPage(res, 'activities/activity', {
        tz: timezone,
        activityBody: undefined,
        activityId: activity_id,
        params: JSON.stringify(req.params) || undefined,
        query: JSON.stringify(req.query) || undefined,
        baseUrl: baseUrl,
        userUiUrl:config.userUIUrl,
        maxImageSize:config.maxImageSize,
        uploadUrl: uploadUrl,
        contentUrl: contentUrl,
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl
        },
        access_token: access_token,
        contentAdminTypes: config.ApplicationTokenTypes.contentAdminTokenType
    })
});   



// promotions
router.get('/activities/:aid/promotions/new', function(req, res, next) {
    var activity_id = req.params.aid;
    var access_token=req.query.access_token || null;

    renderPage.renderPage(res,'view_promotion',{
        tz: timezone,
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
        tz: timezone,
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


function renderUserPageAdmin(req,res,userID,secret){
    var access_token=req.query.access_token || null;

    // //  applicationSettings
    // let appConfig={
    //     mailFrom:config.contentUiAppAdmin.mailfrom,
    //     appBaseUrl:config.contentUIUrl,
    //     appAdmins:config.ApplicationTokenTypes.adminTokenType,
    //     appName:config.contentUiAppAdmin.applicationName,
    // };

    let appConfig={
        mailFrom:config.contentUiAppAdmin.mailfrom,
        appBaseUrl:config.contentUIUrl,
        appAdmins:config.ApplicationTokenTypes.adminTokenType,
        appName:config.contentUiAppAdmin.applicationName,
        userTokentypesTranslations:config.ApplicationTokenTypes.userTokentypesTranslations,
        defaultUserType:config.ApplicationTokenTypes.defaultUserType
    };

    renderPage.renderPage(res,'upgradeUser',{
        access_token:access_token,
        userToUpgradeID:userID,
        properties:{
            contentUIUrl:config.contentUIUrl ,
            commonUIUrl:config.commonUIUrl,
            userUiUrl:config.userUIUrl,
            ApplicationTokenTypes:config.ApplicationTokenTypes,
            applicationSettings:appConfig,
            secretCode:secret
        }
    });
}


router.get('/upgradeuser/:userToUpdate_token', function(req, res, next) {


    async.parallel([
            function(callback) {
                var decode_token=req.params.userToUpdate_token || null;
                commonFunctions.decodeToken(decode_token,function(stausCode,response){
                    if(stausCode==200) {
                        callback(null, response.token._id);
                    }
                    else
                        callback(response);
                });
            },
            function(callback) {
                commonFunctions.getSecureCode(callback);
                // var rqparams = {
                //     url:  config.userUIUrl + "/actions/getcodeforsecurecalls",
                //     headers: {'content-type': 'application/json', 'Authorization': "Bearer " + (config.auth_token || "")},
                //     body:JSON.stringify({appAdmins:config.ApplicationTokenTypes.adminTokenType,ApplicationTokenTypes:config.ApplicationTokenTypes.userTokentypes})
                // };
                // request.post(rqparams,function(err,response){
                //     if(err) callback({error:"InternalError", error_message:err});
                //     try {
                //         response.body = JSON.parse(response.body);
                //     }catch (ex) {
                //         response.body="Internal error due to: " + response.body;
                //     }
                //     if(response.statusCode==200){
                //        callback(null,response.body.secret);
                //
                //     }else callback(response.body);
                // });
            }
        ],
// optional callback
        function(err, results) {
           if(err){
               commonFunctions.getErrorPage(500,"Internal Server Error",err,function(er,content){
                   res.status(er).send(content);
               });

           }else{
                renderUserPageAdmin(req,res,results[0],results[1]);
           }
        });

});



router.get('/manageuser/:userID', function(req, res, next) {

    commonFunctions.getSecureCode(function(err,secret){
        if(err){
            commonFunctions.getErrorPage(500,"Internal Server Error",err,function(er,content){
                res.status(er).send(content);
            });
        }else{
            renderUserPageAdmin(req,res,req.params.userID,secret);
        }
    });

});




router.get('/errorPage', function(req, res, next) {
    var error_code=req.query.error_code || 500;
    var error_message=req.query.error_message || "Internal Server Error";
    var error_showmore=req.query.error_showmore || "";

    console.log(error_code + " " + error_message +" " +error_showmore) ;

    commonFunctions.getErrorPage(error_code,error_message,error_showmore,function(er,content){
        res.status(er).send(content);
    });
});


module.exports = router;