var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var request = require('request');
var promotions=require('./promotions');


let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
config.contentUrl=contentUrl;


router.get('/contentid/:id', function(req, res, next) {

    var id=req.params.id || null;
    if(id){
        var rqparams = {
            url:  config.contentUrl + "contents/"+ id,
            headers: {'Authorization': "Bearer " + (config.auth_token || "")},
        };
        console.log(rqparams.url)
        request.get(rqparams).pipe(res);
    }else{
        res.status(400).send({error:"BadRequest", error_message:"content id field is mandatory"});
    }
});




router.get('/actions/involvements', function(req, res, next) {

    var access_token=(req.query && req.query.access_token)||"";

    var rqparams = {
        url:  contentUrl + "involvements",
        headers: {'Authorization': "Bearer " + access_token }
    };

    return request.get(rqparams).pipe(res);

});



router.get('/actions/search', function(req, res, next) {

    var rqparams = {
        url:  contentUrl + "search?ids="+req.query.ids+"&t="+req.query.t
    };

    return request.get(rqparams).pipe(res);

});


router.use('/:cid/promotions',function(req,res,next){
    req.contentId=req.params.cid;
    next();
},promotions);

module.exports = router;


