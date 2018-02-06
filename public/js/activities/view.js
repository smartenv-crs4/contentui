var activityBody = undefined; //TODO rimuovere

$(document).ready(function () {
    initToken();
    if(typeof activityId != "undefined") {    
        doView(activityId);
    }
    else { //new activity
        newActivity();
    }
    initTranslation();
});

function initTranslation() {
    $.ajax({
        cache: false,
        url: config.contentUIUrl + '/customAssets/translations/translation.json',
        type:"get",
        contentType:"application/json",
        success: function(data) {
            initDictionary(data,config.commonUIUrl,"promotionLanguageManagerInitialized");
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);
            console.error(thrownError);
        }
    });
}

function doView(aid) {
    $("html, body").animate({ scrollTop: 0 }, "slow")
    getContent(aid, function(content) {
        if(content == null) {
            $(".editmode").hide();
            $(".insertmode").hide();
            $(".viewmode").hide();
            $("#lockedContent").hide();
            $(".locked").show();
        }
        else {
            activityBody = content;

            initView(initToolbar);

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
}

function getContent(aid, cb) {
    $.ajax({
        url: contentUrl + (contentUrl.endsWith("/") ? '' : '/') + "contents/" + aid,
        headers: {
            Authorization: "Bearer " + userToken
        },
        success: function(d){
            if(cb) cb(d);
        },
        error: function(e) {
            console.log(e)
            if(e.status == 423) {
                cb(null)
            }
            _growl.error({message: "Error loading content"});
        }
    });
}

function initView(cb) {
    var viewTpl = Handlebars.compile($("#htpl-view").html());
    var contacts = [];

    if(activityBody.facebook) contacts.push({icon:"fa fa-facebook", url:activityBody.facebook, alt:"Facebook"});
    if(activityBody.twitter) contacts.push({icon:"fa fa-twitter", url:activityBody.twitter, alt:"Twitter"});
    if(activityBody.tripadvisor) contacts.push({icon:"fa fa-tripadvisor", url:activityBody.tripadvisor, alt:"Tripadvisor"});
    if(activityBody.instagram) contacts.push({icon:"fa fa-instagram", url:activityBody.instagram, alt:"Instagram"});

    var model = {
        name:activityBody.name,
        description:activityBody.description,
        address: activityBody.address,
        phone: activityBody.phone,
        contacts: contacts,
        email: activityBody.email,
        phone: activityBody.phone,
        images: [],
        cats:activityBody.category
    }
    
    for(let i=0; i<activityBody.images.length; i++) {        
        let col = i % 4;
        var imgsrc = activityBody.images[i];
        //TODO nel caso di immagini su uploadms, contentms dovrebbe restituire 
        //solo gli objectid, non gli url già completi
        model.images.push(normalizeImgUrl(imgsrc)||"assets/img/demo.jpg");
    }
    common.getPromotions(function(promos) {
        model.promos = promos;
        $("#viewbox").html(viewTpl(model));
        initMap(activityBody.name, activityBody.lat, activityBody.lon);
    
        if(cb) cb();
    }, 4);
}

function newActivity() {
    _form_ds.htplAdmin = Handlebars.compile($("#htpl-admin").html());

    loadContent(function() {
        $(".viewmode").hide();
        $(".editmode").hide();
        $(".insertmode").show();
        initMapEdit();

        $(".headline h3").html("Inserimento Attivit&agrave;")
        
        $("#addContentButton").off("click");
        $("#addContentButton").click(function(e) { 
            addContent(); 
        });

        $("#fileUpload").on("change", function() {
            loadImagePreview(this);
        });
    });
}