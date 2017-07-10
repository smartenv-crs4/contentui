var config = require('propertiesmanager').conf;
var request = require('request');
var config = require('propertiesmanager').conf;

let baseUrl = config.contentUIUrl + '/';
let access_token = config.auth_token;

module.exports = {
    renderWithCommonUI(res, page, model) {
        request.get(config.commonUIUrl + "/headerAndFooter" 
                        + "?homePage=/" 
                        + "&afterLoginRedirect=" + config.contentUIUrl 
                        + "&fastSearchUrl=/"
                        + "&loginHomeRedirect=" + baseUrl,
            function (error, response, body) {
                if(error) console.log("ER " + error);

                var commonBody = body ? JSON.parse(body) : undefined;

                return res.render(page, {
                    access_token:access_token,
                    commonUI:{
                      footer: commonBody ? commonBody.footer.html : undefined,
                      footerCss: commonBody ? commonBody.footer.css : undefined,
                      footerScript: commonBody ? commonBody.footer.js : undefined,
                      header: commonBody ? commonBody.header.html : undefined,
                      headerCss: commonBody ? commonBody.header.css : undefined,
                      headerScript: commonBody ? commonBody.header.js : undefined,
                      languagemanager:config.languageManagerLibUrl
                    },
                    model: model                    
                });  
            });
    }
}