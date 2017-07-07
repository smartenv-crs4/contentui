var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var request = require('request');





router.get('/:id', function(req, res, next) {

    var id=req.params.id || null;
    if(id){
        var rqparams = {
            url:  config.contentUrl + "/contents/"+ id,
            headers: {'Authorization': "Bearer " + (config.auth_token || "")},
        };
        request.get(rqparams).pipe(res);
    }else{
        res.status(400).send({error:"BadRequest", error_message:"content id field is mandatory"});
    }
});


module.exports = router;


