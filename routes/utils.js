var config = require('propertiesmanager').conf;
var express = require('express');
var router = express.Router();
var request = require('request');
var _=require('underscore');
var multiparty = require('multiparty');
var magic = require('stream-mmmagic');


let uploadUrl = config.uploadUrl + (config.uploadUrl.endsWith('/') ? '' : '/');
config.uploadUrl=uploadUrl;
let contentUIUrl= config.contentUIUrl + (config.contentUIUrl.endsWith('/') ? '' : '/');






function readStream(allowedMime,req,callback){

    var form = new multiparty.Form();

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




router.post('/upload', function(req, res) {

    let userToken=req.query.access_token;

    if(!userToken){
        return  res.status(400).send({error:"Bad Request",error_message:"No access_token field found in query params"});
    }else {

        var formData = new FormData();
        console.log("XX")
        formData.pipe(req.body.formData)

        var options = {
            url: uploadUrl + "file?access_token=" + userToken,
            method: "POST",
            formData: formData,
            preambleCRLF: true,
            postambleCRLF: true
        };

        request.post(options, function (err, response, body) {
            console.log("XXX")
            console.log(err)
            console.log(body)
            if (!JSON.parse(body).hasOwnProperty('filecode'))  // this is an upload error
                return res.status(500).send({
                    error_code: body.statusCode,
                    error: "Internalerror",
                    error_message: body.message
                });

            res.status(201).send(JSON.parse(body));
        });
    }
});



router.post('/uploadImage', function(req, res) {

    console.log("UPLOAD IMAGE");
    let userToken=req.query.access_token;

    if(!userToken){
        return  res.status(400).send({error:"Bad Request",error_message:"No access_token field found in query params"});
    }else {

        readStream(["image"], req, function (err, stream) {

            var formData = {};

            formData[stream.tag] = {
                value: stream.file,
                options: {
                    filename: stream.filename,
                    knownLength: stream.byteCount,
                    contentType: stream.contentType
                }
            };

            var options = {
                url: uploadUrl + "file?access_token=" + userToken,
                method: "POST",
                formData: formData,
                preambleCRLF: true,
                postambleCRLF: true
            };

            request.post(options, function (err, response, body) {
                if (err)
                    return res.status(500).send({error_code: 500, error: "Internalerror", error_message: err});

                if(200<=response.statusCode<=299){
                    let newBody=JSON.parse(body);
                    newBody.resourceUrl=contentUIUrl+"utils/image?imageUrl="+uploadUrl+"file/"+newBody.filecode;
                    return res.status(201).send(newBody);
                }else {
                    res.status(response.statusCode).send(JSON.parse(body));
                }
            });

        });
    }
});


router.get('/image', function(req, res, next) {

    var imageUrl=req.query.imageUrl;

    var rqparams = {
        url:  imageUrl
    };
    if(imageUrl.indexOf(config.uploadUrl)>=0) {
        rqparams.headers = {'Authorization': "Bearer " + (config.auth_token || "")};
    }
    request.get(rqparams).pipe(res);
});



module.exports = router;

