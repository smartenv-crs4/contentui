var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');
var _=require('underscore');

var multiparty = require('multiparty');



let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
config.contentUrl=contentUrl;
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
config.uploadUrl=uploadUrl;
let userUrl = config.userUrl + (config.userUrl.endsWith('/') ? '' : '/');
config.userUrl=userUrl;


router.post('/:pid/actions/likes', function(req, res, next) {



    var promotionID=req.params.pid;
    var contentID= req.contentId;


    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/actions/likes",
        headers: {'Authorization': "Bearer " + (config.auth_token || "")},
    };
    request.post(rqparams).pipe(res);
});

router.post('/:pid/actions/like', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var access_token=(req.query && req.query.access_token)||"";

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/actions/like",
        headers: {'Authorization': "Bearer " + access_token },
    };
    request.post(rqparams).pipe(res);
});


router.post('/:pid/actions/unlike', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var access_token=(req.query && req.query.access_token)||"";

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/actions/unlike",
        headers: {'Authorization': "Bearer " + access_token },
    };
    request.post(rqparams).pipe(res);
});


router.post('/:pid/actions/doilike', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var access_token=(req.query && req.query.access_token)||"";

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/actions/doilike",
        headers: {'Authorization': "Bearer " + access_token },
    };
    request.post(rqparams).pipe(res);
});

router.post('/:pid/actions/participants', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/actions/participants",
        headers: {'Authorization': "Bearer " + (config.auth_token || "")},
    };
    request.post(rqparams).pipe(res);
});


router.post('/:pid/actions/participate', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var access_token=(req.query && req.query.access_token)||"";

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/actions/participate",
        headers: {'Authorization': "Bearer " + access_token },
    };
    console.log("participate Request");
    request.post(rqparams).pipe(res);
});


router.post('/:pid/actions/unparticipate', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var access_token=(req.query && req.query.access_token)||"";

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/actions/unparticipate",
        headers: {'Authorization': "Bearer " + access_token },
    };
    console.log("participate Request");
    request.post(rqparams).pipe(res);
});

router.post('/:pid/actions/doiparticipate', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var access_token=(req.query && req.query.access_token)||"";

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/actions/doiparticipate",
        headers: {'Authorization': "Bearer " + access_token },
    };
    request.post(rqparams).pipe(res);
});


// http://[contentms]/contents/XYZ/promotions/HKJ/participants
//get promotion participate list
router.get('/:pid/participants', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var access_token=(req.query && req.query.access_token)||"";

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID+"/participants",
        headers: {'Authorization': "Bearer " + access_token }
    };
    request.get(rqparams,function(error,response,body){
        if(error){
            return res.status(500).send({error:"InternalServerError",error_message:error});
        }else{
            var bodyresp=JSON.parse(body);
            if(response.statusCode!=200){
                return res.status(response.statusCode).send(bodyresp);
            }else{
                // get users by Id
                var rqparams = {
                    url:  userUrl + "users/actions/search",
                    headers: {'content-type': 'application/json','Authorization': "Bearer " + (config.auth_token || "")},
                    body: JSON.stringify({fields:["name","surname","avatar"],searchterm:{usersId:bodyresp.participants}})
                };

                return request.post(rqparams).pipe(res);
            }
        }
    });
});



router.get('/promoid/:pid', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.contentId;

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID,
        headers: {'Authorization': "Bearer " + (config.auth_token || "")},
    };

    request.get(rqparams).pipe(res);
});


router.put('/:pid', function(req, res, next) {


    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var body=req.body;

    if (!body.promotion || _.isEmpty(body.promotion)) {
        return res.status(400).send({error: "BadREquest", error_message: 'request body missing'});
    }else{

        var rqparams = {
            url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID,
            headers: {'content-type': 'application/json','Authorization': "Bearer " + (body.user || "")},
            body:JSON.stringify(body.promotion)
        };
        request.put(rqparams).pipe(res);
    }
});



router.delete('/:pid', function(req, res, next) {


    var promotionID=req.params.pid;
    var contentID= req.contentId;
    var access_token=req.query.access_token || null;

    if (!access_token) {
        return res.status(400).send({error: "BadREquest", error_message: 'Query param access_token  missing'});
    }else{

        var rqparams = {
            url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID,
            headers: {'content-type': 'application/json','Authorization': "Bearer " + (access_token)},
        };
        request.del(rqparams).pipe(res);
    }
});



router.post('/', function(req, res, next) {

    var contentID= req.contentId;
    var body=req.body;

    if (!body) {
        return res.status(400).send({error: "BadREquest", error_message: 'request body missing'});
    }else{
        if (!body.promotion || _.isEmpty(body.promotion)) {
            return res.status(400).send({error: "BadREquest", error_message: 'request promotion body field missing or empty'});

        }else{
            var rqparams = {
                url:  contentUrl + "contents/"+ contentID+ "/promotions",
                headers: {'content-type': 'application/json','Authorization': "Bearer " + (body.user || "")},
                body:JSON.stringify(body.promotion)
            };
            request.post(rqparams).pipe(res);
        }
    }
});


module.exports = router;

