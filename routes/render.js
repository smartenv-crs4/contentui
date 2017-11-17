var async=require('async');
var request = require('request');
var config = require('propertiesmanager').conf;
var commonFunction=require('./commonFunctions');
let baseUrl = config.contentUIUrl + '/';

function render(res,page,model,commonBody) {
    model.commonUI={
        footer: commonBody ? commonBody.footer.html : undefined,
        footerCss: commonBody ? commonBody.footer.css : undefined,
        footerScript: commonBody ? commonBody.footer.js : undefined,
        header: commonBody ? commonBody.header.html : undefined,
        headerCss: commonBody ? commonBody.header.css : undefined,
        headerScript: commonBody ? commonBody.header.js : undefined,
        languagemanager:config.languageManagerLibUrl
    };
    console.log("||||||||||||| RENDERPAGE " + model.tokenError);
    return res.render(page,model);
}

module.exports = {
    renderPage(res, page, model) {

        let headersConfig=config.headerParams;
        let commonUiURL=config.commonUIUrl+"/headerAndFooter?";
        let commonUiURLWithNoToken;
        async.eachOf(headersConfig, function(value,key, callback) {


            if(value && value.startsWith("*")){
                commonUiURL+=(key+"="+config[value.substr(1)]+"&");
            }else{
                if (value)  commonUiURL+=(key+"="+value+"&");
            }
            callback();
        }, function(err) {
            // no error

            commonUiURLWithNoToken=commonUiURL.slice(0,-1); // remove last '&' in the Url
            if(model.access_token)
                commonUiURL+=("access_token="+model.access_token);
            else
                commonUiURL=commonUiURLWithNoToken


            console.log(model.access_token);


            request.get(commonUiURL,function (error, response, body) {
                    if(error) {
                        commonFunctions.getErrorPage(500,"500","Internal Server Error",error,function(er,content){
                            res.send(content);
                        });
                    }else {

                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! RenserPage:" + page);
                        console.log(body);

                        var commonBody = body ? JSON.parse(body) : undefined;

                        if (commonBody && commonBody.error) {
                            let tmpError=commonBody.error_message;
                            request.get(commonUiURLWithNoToken, function (error, response, body) {
                                if (error){
                                    commonFunctions.getErrorPage(500,"500","Internal Server Error",error,function(er,content){
                                        res.send(content);
                                    });
                                }else {

                                    var commonBody = body ? JSON.parse(body) : undefined;

                                    if (commonBody && commonBody.error) {
                                        commonFunctions.getErrorPage(response.statusCode,response.statusCode,commonBody.error,commonBody.error_message,function(er,content){
                                            res.send(content);
                                        });

                                    } else {
                                        model.tokenError=tmpError;
                                        return render(res, page, model, commonBody);
                                    }
                                }

                            });
                        } else {
                            model.tokenError=null;
                            return render(res, page, model, commonBody);
                        }

                    }

            });
        });
    }
};