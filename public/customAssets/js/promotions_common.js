
function getPromotionParticipants(contentID,promotionID,callback){
    jQuery.ajax({
        url: config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/participants",
        type: "POST",
        success: function(data, textStatus, xhr){
            return callback(null,data.total);
        },
        error: function(xhr, status){
            return callback(i18next.t("error.getparticipants"),null);
        }
    });

}


function getPromotionLikes(contentID,promotionID,callback){
    jQuery.ajax({
        url: config.contentUIUrl + (config.contentUIUrl.endsWith('/')? "":"/")+ 'contents/'+ contentID + "/promotions/" + promotionID+"/actions/likes",
        type: "POST",
        success: function(data, textStatus, xhr){
            return callback(null,data.total);
        },
        error: function(xhr, status){
            return callback(i18next.t("error.getlikes"),null);
        }
    });
}