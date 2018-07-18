/**
 * Created by Alessandro on 21/04/2017.
 */

var properties = require('propertiesmanager').conf;
var request=require("request");

exports.getErrorPage=function (errorCode,errorMessage,showMore,callback){
    var url=properties.commonUIUrl+"/errorPage?custom_error_message=true&error_code="+errorCode+"&error_message="+ errorMessage +"&showMore_message="+showMore+"&defaultHomeRedirect="+properties.contentUIUrl;
    request.get(url,function(err,response,body){
        if(err) return callback(500,{error:"Internal Server Error", error_message:err});
        else{
            return callback(200,body);
        }
    });
}


exports.decodeToken=function(decode_token,callback){
    if(decode_token){
        var rqparams = {
            url:  properties.authUrl + "/tokenactions/decodeToken",
            headers: {'content-type': 'application/json', 'Authorization': "Bearer " + (properties.auth_token || "")},
            body:JSON.stringify({decode_token:decode_token})
        };
        request.post(rqparams,function(err,response){
            if(err) return callback(500,{error:"InternalError", error_message:err});
            else return callback(response.statusCode,JSON.parse(response.body));
        });
    }else{
        return callback(400,{error:"BadRequest", error_message:"decode_token field is mandatory"});
    }
}



exports.getSecureCode=function(callback){
    var rqparams = {
        url:  properties.userUIUrl + "/actions/getcodeforsecurecalls",
        headers: {'content-type': 'application/json', 'Authorization': "Bearer " + (properties.auth_token || "")},
        body:JSON.stringify({appAdmins:properties.ApplicationTokenTypes.adminTokenType,ApplicationTokenTypes:properties.ApplicationTokenTypes.userTokentypes})
    };
    request.post(rqparams,function(err,response){
        if(err) callback({error:"InternalError", error_message:err});
        try {
            response.body = JSON.parse(response.body);
        }catch (ex) {
            response.body="Internal error due to: " + response.body;
        }
        if(response.statusCode==200){
            callback(null,response.body.secret);

        }else callback(response.body);
    });
};


