var async=require('async');
var _=require('underscore');
var request = require('request');
var config = require('propertiesmanager').conf;
var commonFunctions=require('./commonFunctions');
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

    return res.render(page,model);
}



function getValueFromconfig(parameter){
    let fields=parameter.split(".");
    let respo=config;

    fields.forEach(function(field){
        respo=respo[field];
    });

    return(respo);

}


function getValue(value){
    let plus,configValue;

    console.log(value);
    if(value && value.startsWith("*")){

        plus=value.indexOf("+");
        if(plus<0) {
            configValue=getValueFromconfig(value.substr(1));
        }
        else{
            configValue=getValueFromconfig(value.substring(1,plus));
            configValue=configValue+ value.substr(plus+1);
        }
    }else{
        configValue=value;
    }
    console.log(value);
    return configValue;
}



module.exports = {
    renderPage(res, page, model) {

        //  applicationSettings
        let appConfig={
            mailFrom:config.contentUiAppAdmin.mailfrom,
            appBaseUrl:config.contentUIUrl,
            appAdmins:config.ApplicationTokenTypes.adminTokenType,
            appName:config.contentUiAppAdmin.applicationName,
            userTokentypes:config.ApplicationTokenTypes.userTokentypes,
            userTokentypesTranslations:config.ApplicationTokenTypes.userTokentypesTranslations,
            defaultUserType:config.ApplicationTokenTypes.defaultUserType
        };

        let applicationTokenTypes=_.difference(config.ApplicationTokenTypes.userTokentypes,config.ApplicationTokenTypes.adminTokenType);


        let headersConfig=config.headerParams;
        let commonUiURL=config.commonUIUrl+"/headerAndFooter?enableUserUpgrade="+applicationTokenTypes+"&applicationSettings="+JSON.stringify(appConfig)+"&";
        let commonUiURLWithNoToken;

        model.properties.headerParams={};
        var headerParams=model.properties.headerParams;
        model.properties.userUIUrl=config.userUIUrl; // needed by menuSearchJS.ejs


        let configValue,tmpConf;

        console.log(headersConfig);

        async.eachOf(headersConfig, function(value,key, callback) {

            if(_.isObject(value)){
                tmpConf={};
                _.each(value,function (objValue,objKey) {
                    configValue=getValue(objValue);
                    tmpConf[objKey]=configValue;
                });

                headerParams[key]=tmpConf;
                commonUiURL += (key + "=" +JSON.stringify(tmpConf) + "&");
            }else{
                configValue=getValue(value);
                if(configValue){
                    commonUiURL += (key + "=" + configValue + "&");
                    headerParams[key]=configValue;
                }

            }
            callback();
        }, function(err) {  // no error

            commonUiURLWithNoToken=commonUiURL.slice(0,-1); // remove last '&' in the Url
            if(model.access_token)
                commonUiURL+=("access_token="+model.access_token)+"&afterLoginRedirectTo="+headerParams.loginHomeRedirect;
            else
                commonUiURL=commonUiURLWithNoToken;


            //console.log(model.access_token);

            request.get(commonUiURL,function (error, response, body) {
                if(error) {
                    commonFunctions.getErrorPage(500,"Internal Server Error",error,function(er,content){
                        res.send(content);
                    });
                }else {
                    var commonBody = undefined;
                    if(body) {
                        try {
                            commonBody = JSON.parse(body);
                        }
                        catch(e) {
                            console.log(e);
                        }
                    }

                    if (commonBody && commonBody.error) {
                        let tmpError=commonBody.error_message;
                        request.get(commonUiURLWithNoToken, function (error, response, body) {  //resend request to header for not logged in user
                            if (error){
                                commonFunctions.getErrorPage(500,"Internal Server Error",error,function(er,content){
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