var _form_ds = {
    admins     : undefined,
    htplAdmin  : undefined,    
}
var _growl = undefined;

$(document).ready(function() {
    initToken();
    _growl = $.growl;
    if(activityBody) {
        common.isAdmin([], function(isAuth) {
            if(!isAuth) {
                window.location.href = baseUrl + "activities/" + activityBody.idcontent;
            }
            else {
                _form_ds.htplAdmin = Handlebars.compile($("#htpl-admin").html());
                _form_ds.admins = activityBody.admins || [];

                common.getPromotions();

                getAdmins(_form_ds.admins, renderAdmins);
            }
        })
    }
    else {
        common.canWrite(contentAdminTypes, function(isAuth){
            if(!isAuth) {
                window.location.href = baseUrl;
            }
        })
    }
    
   

    //TODO delete admin
    //TODO update _admins and redraw leftbar
})

function renderAdmins(admins) {
    $("#lbar").html(_form_ds.htplAdmin({admins:admins}));
    $(".delAdmin").click(function(e) {        
        e.preventDefault();
        var uid = this.getAttribute("data-admin-id");
        removeAdmin(uid, function(newadmins) {
            _form_ds.admins = newadmins;            
            getAdmins(newadmins, renderAdmins);
        });
    })
}



function getAdmins(admList, cb) {    
    if(admList.length > 0) {        
        var adms = admList.join('&adm=');        
        $.ajax({
            url: baseUrl + "activities/admins" + "?adm=" + adms,
            headers: {
                Authorization: "Bearer " + userToken
            },
            cache: false,
            method: 'GET',
            success: function(data){
                if(cb) cb(data);
            },
            error: function(e) {
                console.log(e);
                _growl.warning({message: "Something went wrong when getting admins list"});
            }
        });
    }
}

function removeAdmin(uid, cb) {
    if(uid) {        
        var aid = activityBody._id;
        $.ajax({
            url: contentUrl + "contents/" + aid + "/actions/removeAdmin",
            method: 'POST',
            headers: {
                Authorization: "Bearer " + userToken
            },
            data: {userId:uid},
            success: function(d){
                //console.log(d);
                _growl.notice({message:"Admin successfully removed"});
                if(cb) cb(d.admins);
            },
            error: function(e) {
                console.log(e);
                _growl.error({message: "Error removing admin"});
            }
        });
    }
    else throw("Missing admin ID");
}