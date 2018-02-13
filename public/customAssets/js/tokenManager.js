
if(undefined===tokenError){
    let tokenError=null;
}

// if(!userToken) {
//     if(window.localStorage.token) {
//         if(!tokenError) {
//             jQuery.ajax({
//                 url: config.contentUIUrl + (config.contentUIUrl.endsWith("/") ? '' : '/') + "token/actions/setToken?access_token=" + window.localStorage.token,
//                 type: "POST",
//                 success: function (data, textStatus, xhr) {
//                     let tmpHref=window.location.href;
//                     userToken = window.localStorage.token;
//                     setOrReplaceQueryParam("uuid",tmpHref,data.uuId,function(err,newUrl){
//                         window.location.href = newUrl;
//                     });
//                 },
//                 error: function (xhr, status) {
//                     if (!tokenError) {
//                         var msgRsp = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.tokenError");
//                         msgRsp = "TokenManager Script: " + msgRsp;
//                         jQuery.jGrowl(msgRsp, {theme: 'bg-color-red', life: 5000});
//                     }
//                 }
//             });
//         }else {
//             window.localStorage.removeItem("token");
//         }
//     }
// }else{
//     if(!tokenError)
//         window.localStorage.setItem("token", userToken);
//     else
//         window.localStorage.removeItem("token");
// }



function validateRequestAndUpdateUrl(access_token){

    if(access_token){ // from request with access_token in url
        jQuery.ajax({
            url: config.contentUIUrl + (config.contentUIUrl.endsWith("/") ? '' : '/') + "token/actions/setToken?access_token=" + access_token,
            type: "POST",
            success: function (data, textStatus, xhr) {
                let tmpHref=window.location.href;
                removeParams(["default","access_token"],tmpHref,function(err,newLink){
                    if(!err){
                        setOrReplaceQueryParam("uuid",newLink,data.uuId,function(err,newUrl){
                            window.location.href = newUrl;
                        });
                    }
                });

            },
            error: function (xhr, status) {
                var msgRsp = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.tokenError");
                msgRsp = "TokenManager Script: " + msgRsp;
                jQuery.jGrowl(msgRsp, {theme: 'bg-color-red', life: 5000});
            }
        });
    }else{ //from request with no access_token

        if(window.localStorage.token) { // check if client session is open

            //remap call with uuid param
            jQuery.ajax({
                url: config.contentUIUrl + (config.contentUIUrl.endsWith("/") ? '' : '/') + "token/actions/setToken?access_token=" + window.localStorage.token,
                type: "POST",
                success: function (data, textStatus, xhr) {
                    let tmpHref=window.location.href;
                    removeParams(["default","access_token"],tmpHref,function(err,newLink){
                        setOrReplaceQueryParam("uuid",newLink,data.uuId,function(err,newUrl){
                            window.location.href = newUrl;
                        });
                    });
                },
                error: function (xhr, status) {
                    var msgRsp = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.tokenError");
                    msgRsp = "TokenManager Script: " + msgRsp;
                    jQuery.jGrowl(msgRsp, {theme: 'bg-color-red', life: 5000});
                }
            });

        }else{ //  if no client session is open
            // window.localStorage.removeItem("token");
            removeParams(["uuid","access_token"],window.location.href,function(err,newLink){
                setOrReplaceQueryParam('default',newLink,"true",function(err,newUrl){
                    window.location.href = newUrl;
                });
            });
        }
    }

}

function removeParam(key,url,callback) {

    let params = url.split('?');
    let newurl;
    if (!(params.length == 1)) {

        newurl = params[0] + '?';
        params = params[1];
        params = params.split('&');

        $.each(params, function (index, value) {
            var v = value.split('=');
            if (v[0] != key) newurl += value + '&';
        });

        newurl = newurl.slice(0, -1); // remove last ? or &
    }else{
        newurl=url
    }

    callback(null,newurl);
}


function removeParams(keys,url,callback) {

    var newUrl=url;
    async.forEachOf(keys, function (value, key, nextKey) {
        removeParam(value,newUrl,function(err,updatedUrl){
           newUrl=updatedUrl;
            nextKey();
        });
    }, function (err) {
        if (err) console.error(err.message);
        callback(null,newUrl);
    });
}



function setOrReplaceQueryParam(key, url, newValue,callback){

        removeParam(key,url,function(err,newUrl){
            if(newUrl.indexOf('?')>=0)
                newUrl+='&';
            else
                newUrl+='?';

            newUrl+=key+"="+newValue;
            callback(null,newUrl);
        })
}




function initToken() {
    if(userToken) {
        if(!tokenError)
            window.localStorage.setItem("token", userToken);
        else
            window.localStorage.removeItem("token");
    }
    else if(window.localStorage.token) {  // in new version from 12/02/18 commit, it should be not reachable due blankPage verification
        if(!tokenError)
            userToken = window.localStorage.token;
        else
            window.localStorage.removeItem("token");
    }
}



function removeTokenAfterLogOut(){
    window.localStorage.removeItem("token");
    userToken=null;
}