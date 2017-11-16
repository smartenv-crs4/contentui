var async=require('async');
var config = require('propertiesmanager').conf;
var request = require('request');
var config = require('propertiesmanager').conf;

let baseUrl = config.contentUIUrl + '/';

module.exports = {
    renderPage(res, page, model) {

        let headersConfig=config.headerParams;
        let commonUiURL=config.commonUIUrl+"/headerAndFooter?";
        async.eachOf(headersConfig, function(value,key, callback) {


            if(value && value.startsWith("*")){
                commonUiURL+=(key+"="+config[value.substr(1)]+"&");
            }else{
                if (value)  commonUiURL+=(key+"="+value+"&");
            }
            callback();
        }, function(err) {
            // no error

            if(model.access_token)
                commonUiURL+=("access_token="+model.access_token);
            else
                commonUiURL=commonUiURL.slice(0,-1); // remove last '&' in the Url


            request.get(commonUiURL,function (error, response, body) {
                    if(error) console.log("ER " + error);

                    var commonBody = body ? JSON.parse(body) : undefined;
                    model.commonUI={
                        footer: commonBody ? commonBody.footer.html : undefined,
                        footerCss: commonBody ? commonBody.footer.css : undefined,
                        footerScript: commonBody ? commonBody.footer.js : undefined,
                        header: commonBody ? commonBody.header.html : undefined,
                        headerCss: commonBody ? commonBody.header.css : undefined,
                        headerScript: commonBody ? commonBody.header.js : undefined,
                        languagemanager:config.languageManagerLibUrl
                    };
                    return res.render(page,model);
            });
        });
    }
};