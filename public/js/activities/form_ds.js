var _form_ds = {
    admins     : [],
    htplAdmin  : undefined,    
}
var _growl = undefined; //wa removeAdmin jquery+growl scope.... (?)

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
                _form_ds.admins = _form_ds.admins.concat(activityBody.admins);

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
})

function renderAdmins(admins) {
    $("#adminlist").html(_form_ds.htplAdmin({admins:admins}));
    $(".delAdmin").click(function(e) {        
        e.preventDefault();
        var uid = this.getAttribute("data-admin-id");
        editAdmins(uid, 'remove', function(newadmins) {
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

//TODO popup conferma rimozione
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

function editAdmins(uid, action, cb) {
    if(uid && action) {
        var aid = activityBody._id;
        $.ajax({
            url: contentUrl + (contentUrl.endsWith("/") ? '' : '/') 
                + "contents/" + aid + "/actions/" 
                + (action=='add' ? "addAdmin" : "removeAdmin"),
            method: 'POST',
            headers: {
                Authorization: "Bearer " + userToken
            },
            data: {userId:uid},
            success: function(d){
                //console.log(d);
                _growl.notice({message:"Admin list successfully modified"});
                if(cb) cb(d.admins);
            },
            error: function(e) {
                console.log(e);
                _growl.error({message: "Error editing admins"});
            }
        });
    }
    else throw("Missing admin ID or action");
}


//TODO popup conferma aggiunta
var users = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('email'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    //prefetch: '../data/films/post_1960.json',
    remote: {
        url: baseUrl + (baseUrl.endsWith("/") ? '' : '/') + "activities/users/%QUERY",
        headers : {
            Authorization: "Bearer " + userToken
        },
        wildcard: '%QUERY',
        filter: function (users) {
            $(".tt-dataset").addClass("container-fluid");            
            var notAdmins = [];
            for(var i=0; i<users.length; i++) {                
                if((_form_ds.admins.indexOf(users[i]._id) == -1) && users[i]._id != activityBody.owner) {
                    notAdmins.push(users[i]);
                }
            }
            // Map the remote source JSON array to a JavaScript object array
            return $.map(notAdmins, function (user) {
                return {
                    uid: user._id,
                    email: user.email,
                    name: ((user.name ? user.name : '') + (user.surname ? ' ' + user.surname : '')),
                    avatar: user.avatar || "/img/avatar.png"
                };
            });
        }
    }
});


$('.typeahead').bind('typeahead:select', function(ev, suggestion) {
    var uid = suggestion.uid;
    if(uid) {
        editAdmins(uid, 'add', function(newadmins) {
            _form_ds.admins = newadmins;            
            getAdmins(newadmins, renderAdmins);
        });
    }
});


$('#searchusers .typeahead').typeahead(null, {
    display: 'email',
    source: users,
    templates: {
        suggestion: Handlebars.compile($("#htpl-tah-menu").html())
    }
});
