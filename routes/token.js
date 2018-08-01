var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');
var jsonDb=require('./jsonDb');
var commonFunctions=require('./commonFunctions');




router.post('/actions/setToken', function(req, res, next) {
    jsonDb.setKey(req.query.access_token,function(err,uuId){
        if(err)
            return res.status(500).send({error:"InternalServer Error", error_message:"Error in actions/setToken " + err});
       else
           return res.status(200).send({uuId:uuId});
    });

});


router.get('/admintokens', function(req, res, next) {

    var rqparams = {
        url:  config.authUrl + "/tokenactions/getsupeusertokenlist",
        headers: {'Authorization': "Bearer " + (config.auth_token || "")},
    };
    request.get(rqparams).pipe(res);
});



router.get('/decode', function(req, res, next) {


    var decode_token=req.query.decode_token || null;
    commonFunctions.decodeToken(decode_token,function(stausCode,response){
        res.status(stausCode).send(response);
    });

    // if(decode_token){
    //     var rqparams = {
    //         url:  config.authUrl + "/tokenactions/decodeToken",
    //         headers: {'content-type': 'application/json', 'Authorization': "Bearer " + (config.auth_token || "")},
    //         body:JSON.stringify({decode_token:decode_token})
    //     };
    //     request.post(rqparams).pipe(res);
    // }else{
    //     res.status(400).send({error:"BadRequest", error_message:"decode_token field is mandatory"});
    // }
});





module.exports = router;

