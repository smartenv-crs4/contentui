var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');

var multiparty = require('multiparty');





let baseUrl = config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');
let contentUrl = config.contentUrl + (config.contentUrl.endsWith('/') ? '' : '/');
config.contentUrl=contentUrl;
let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
config.uploadUrl=uploadUrl;





router.get('/:cid/:pid', function(req, res, next) {

    var promotionID=req.params.pid;
    var contentID= req.params.cid;

    var rqparams = {
        url:  contentUrl + "contents/"+ contentID+ "/promotions/" + promotionID,
        headers: {'Authorization': "Bearer " + (config.auth_token || "")},
    };
    request.get(rqparams).pipe(res);
});





module.exports = router;

