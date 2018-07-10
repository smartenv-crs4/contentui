


function redirectToLogin(){
    window.location.replace(config.userUiUrl+"?homeRedirect="+ config.headerParams.loginHomeRedirect + "&loginHomeRedirect=" + config.headerParams.loginHomeRedirect+"&redirectTo="+window.location.href);
}

function redirectToErrorPage(error_code,error_message,error_showmore){
    window.location.replace(config.contentUIUrl+"/errorPage?error_code="+error_code+"&error_message="+error_message+ "&error_showmore="+error_showmore);
}

function checkIfisAdmin(){

    jQuery.ajax({
        url: config.contentUIUrl + "/token/decode?decode_token="+ userToken,
        type: "GET",
        success: function(data, textStatus, xhr){
            if(data.valid){

                if(config.ApplicationTokenTypes.adminTokenType.indexOf(data.token.type)>=0){// is user Admin
                    var userProfilePage=config.userUiUrl+ "/userprofileAsAdmin/"+ userToUpgradeID +"/?access_token=" + userToken + "&logout=" + config.headerParams.userUiLogoutRedirect + "&homeRedirect=" + config.headerParams.loginHomeRedirect + "&loginHomeRedirect=" + config.headerParams.loginHomeRedirect+"&secret="+config.secretCode+ "&redirectTo="+window.location.href+"&applicationSettings="+JSON.stringify(config.applicationSettings)+"&fastSearchUrl="+JSON.stringify(config.headerParams.fastSearchUrl);//"&enableUserUpgrade="+config.enableUserUpgrade
                    //console.log(userProfilePage);
                    window.location.replace(userProfilePage);
                }else { //is not Admin
                    redirectToErrorPage(401,(i18next.t("error.401")|| "You are not authorized to access this resource"),(i18next.t("error.notadmin")|| "You aren't logged in as application Administrator"));
                    //window.location.replace(config.contentUIUrl+"/errorPage?error_code=401&error_message="+(i18next.t("error.401")|| "You are not authorized to access this resource")+ "&error_showmore="+(i18next.t("error.notadmin")|| "You aren't logged in as application Administrator"));
                }
            }else{
                redirectToLogin();
            }
        },
        error: function(xhr, status)
        {
            var msg;
            try{
                msg = ((xhr.responseJSON!=null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || "";
            }
            catch(err){
                msg = "Internal ServerError";
            }
            msg="decodetoken in checkIfisAdmin Function " + msg;
            redirectToErrorPage(500,(i18next.t("error.500") || "Internal Server Error"),(i18next.t("error.decodeToken")|| "Error While Decoding Token")+": "+msg);
        }
    });
}