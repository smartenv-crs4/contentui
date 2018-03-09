var common = {
    
    getPromotions: function getPromotions(cb, limit) {
        var that = this;
        var from = new Date();
        
        $.ajax({
            url: contentUrl + "contents/" + activityBody._id+"/promotions/?sdate=" + from + (limit ? "&limit=" + limit : ''),
            type: 'GET',
            success: function(data){
                var promos = data.promos;
                for(var i=0; i<promos.length; i++) {
                    promos[i].startDate = moment(promos[i].startDate).format("DD/MM/YYYY")
                    promos[i].endDate  = moment(promos[i].endDate).format("DD/MM/YYYY")
                    promos[i].lastUpdate = moment(promos[i].lastUpdate).format("DD/MM/YYYY")
                    for(var j=0; j<promos[i].images.length; j++) {
                        promos[i].images[j] = that.normalizeImgUrl(promos[i].images[j])
                    }
                }
                if(cb) cb(promos)
            },
            error: function(e) {
                console.log(e);
            }
        });
    },

    isAdmin: function(contentAdmins, cb) {
        if(contentAdmins == null) contentAdmins = [];
        if(!cb) throw ("Invalid callback")
        getAdminTokenType(function(adminTypes) {
            decodeToken(function(data) {
                if(data.valid) {
                    var isAuth = contentAdmins.indexOf(data.token._id) != -1;
                    var isSuperAdmin = adminTypes.indexOf(data.token.type) != -1;
                    if(isAuth || isSuperAdmin)
                        cb(isAuth, isSuperAdmin);
                    else 
                        cb(false, false)
                }
                else cb(false)
            })
        })
    },

    canWrite: function(contentAdminTypes, cb) {
        if(!cb) throw ("Invalid callback")
        getAdminTokenType(function(adminTypes) {
            decodeToken(function(data) {
                if(data.valid) {
                    if((contentAdminTypes.indexOf(data.token.type) != -1) || (adminTypes.indexOf(data.token.type) != -1))
                        cb(true);
                    else 
                        cb(false)
                }
                else cb(false)
            })
        })
    },

    normalizeImgUrl: function(url) {
        /*
        if(isURL(url)) return url;
        else {
            //TODO verificare sia un formato ObjectID valido
            return baseUrl + "activities/image/" + url
        }
        */
        //TODO sostituire con codice sopra dopo modifica contentms
        if(url) {
            var ret = url;
            if(url.startsWith(uploadUrl)) {
                var id = url.split('file/')[1];
                ret = baseUrl + "activities/image/" + id;
            }
            return ret;
        }
    }
}



function decodeToken(cb) {
    jQuery.ajax({
        url: baseUrl + "token/decode?decode_token=" + userToken,
        type: "GET",
        success: function (data, textStatus, xhr) {
            if (data.valid) {                
                cb(data);
            } else {
                cb({valid:false});
            }
        },
        error: function (xhr, status) {
            var msg = "token error";
            try {
                msg = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.invalidtoken");
            }
            catch (err) {
                msg = "invalid Token";
            }            
            cb({valid:false, error:msg});
        }
    });
}

// get Admin Token Type
function getAdminTokenType(cb) {
    jQuery.ajax({
        url: baseUrl + "token/admintokens",
        type: "GET",
        success: function (data, textStatus, xhr) {            
            cb(data.superuser);
        },
        error: function (xhr, status) {
            var msg;
            try {
                msg = ((xhr.responseJSON != null) && (xhr.responseJSON.error_message || xhr.responseJSON.message)) || i18next.t("error.admintokentype");
            }
            catch (err) {
                msg = err
            }            
            console.log(msg);
            cb([]);
        }
    });
}