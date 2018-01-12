var activityBody = undefined; //TODO rimuovere

$(document).ready(function () {
    initToken();

    getContent(activityId, function(content) {
        if(content == null) {
            $(".editmode").hide();
            $(".insertmode").hide();
            $(".viewmode").hide();
            $("#lockedContent").hide();
            $(".locked").show();
        }
        else {
            activityBody = content;

            initView();
            initAdminTool();
        
            var admins = activityBody.admins;
            admins.push(activityBody.owner);

            $(".editmode").hide();
            $(".insertmode").hide();
            $("#lockedContent").hide();
            $(".viewmode").show();
            common.isAdmin(admins, function(isAuth, isSAdmin){
                if(isAuth || isSAdmin) {
                    
                    _form_ds.htplAdmin = Handlebars.compile($("#htpl-admin").html());
                    _form_ds.admins = _form_ds.admins.concat(spliceOwner(admins));

                    getAdmins(_form_ds.admins, renderAdmins);
                    $(".viewonly").hide();
                    $(".loggedonly").show()
                    if(isSAdmin) {
                        $(".sadmin").show()
                        if(activityBody.published) {
                            $("#lockContent").addClass("lock")
                            $("#lockContent").attr("title", "lock content")
                            $("#lockContent i").addClass("fa-unlock")
                        }
                        else {
                            $("#lockContent i").addClass("fa-lock")
                            $("#lockContent").attr("title", "unlock content")
                        }
                    }
                    else if(!activityBody.published) {                        
                        $("#lockedContent").show();
                        $("#lockedContent").parent().click(function() {
                            bootbox.alert("This content has been locked by the system administrator.");
                        })
                    }
                }
                else {
                    $(".loggedonly").hide();
                    $(".viewonly").show();
                }
            });
        }
    });
});

function getContent(aid, cb) {
    $.ajax({
        url: contentUrl + (contentUrl.endsWith("/") ? '' : '/') + "contents/" + aid,
        headers: {
            Authorization: "Bearer " + userToken
        },
        success: function(d){
            //console.log(d);
            if(cb) cb(d);
        },
        error: function(e) {
            console.log(e)
            if(e.status == 423) {
                cb(null)
            }
            //_growl.error({message: "Error loading content"});
        }
    });
}

function initView() {
    $("#name").text(activityBody.name);
    $("#description").text(activityBody.description);
    
    $('#addPromotionButton').one("click", function(e) { addPromotion(); });

    var imgThumb = Handlebars.compile($("#htpl-img").html());

    $("#imageContainer").empty();
    for(let i=0; i<activityBody.images.length; i++) {        
        let col = i % 4;
        var imgsrc = activityBody.images[i];
        //TODO nel caso di immagini su uploadms, contentms dovrebbe restituire 
        //solo gli objectid, non gli url già completi
        //TODO plugin per scorrere la gallery
        //$("#imageContainer div[data-img-thumb-pos='" + col + "\']").append(img).append('<br>');
        $("#imageContainer").append(imgThumb({src:normalizeImgUrl(imgsrc)||"assets/img/demo.jpg"}));
    }
    var catBox = $("#cp-cats").html();
    $("#catDrop div").empty();
    for(let i=0; i<activityBody.category.length; i++) {
        $.ajax(contentUrl + "categories/"+activityBody.category[i])
        .done(function(cat) {
            var col = i%4;
            $("#catDrop div[data-cp-cbox-pos='" + col + "\']").append($(catBox).append(cat.name));
        })
    }
    initMap(activityBody.name, activityBody.description, activityBody.lat, activityBody.lon);
    common.getPromotions();
}

function lockContent(lock, cb) {
    var aid = activityBody._id;
    $.ajax({
        url: contentUrl + (contentUrl.endsWith("/") ? '' : '/') 
            + "contents/" + aid + "/actions/" 
            + (lock ? "lock" : "unlock"),
        method: 'POST',
        headers: {
            Authorization: "Bearer " + userToken
        },
        success: function(d){
            //console.log(d);
            _growl.notice({message:"Content successfully locked"});
            if(cb) cb(d);
        },
        error: function(e) {
            console.log(e);
            _growl.error({message: "Error editing admins"});
        }
    });
}