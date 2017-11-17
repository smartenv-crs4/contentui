var _form_ds = {
    admins     : undefined,
    htplAdmin  : undefined,
    token      : undefined //TODO uniformare!!!!!
}

$(document).ready(function() {
    initToken();

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
            getAdmins(newadmins, renderAdmins);
        });
    })
}

function getAdmins(admList, cb) {
    if(admList.length > 0) {
        var adms = admList.join('&adm=');
        console.log(baseUrl)
        $.ajax({
            url: baseUrl + "activities/admins" + "?adm=" + adms,
            headers: {
                Authorization: "Bearer " + _form_ds.token
            },
            cache: false,
            method: 'GET',
            success: function(data){                
                if(cb) cb(data);
            },
            error: function(e) {
                console.log(e);
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
                Authorization: "Bearer " + _form_ds.token
            },
            data: {userId:uid},
            success: function(d){
                console.log(d);
                if(cb) cb(d);
            },
            error: function(e) {
                console.log(e);
            }
        });
    }
    else throw("Missing admin ID");
}