
if(tokenError===undefined){
    let tokenError=null;
}

if(!userToken) {
    if(window.localStorage.token) {
        if(!tokenError) {
            jQuery.ajax({
                url: config.contentUIUrl + "/token/actions/setToken?access_token=" + window.localStorage.token,
                type: "POST",
                success: function (data, textStatus, xhr) {
                    let tmpHref=window.location.href;
                    setOrReplaceQueryParam("uuid",tmpHref,data.uuId,function(err,newUrl){
                        window.location.href = newUrl;
                    });
                },
                error: function (xhr, status) {
                    if (!tokenError) {
                        var msgRsp = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.tokenError");
                        msgRsp = "TokenManager Script: " + msgRsp;
                        jQuery.jGrowl(msgRsp, {theme: 'bg-color-red', life: 5000});
                    }
                }
            });
        }else {
            window.localStorage.removeItem("token");
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
    else if(window.localStorage.token) {
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