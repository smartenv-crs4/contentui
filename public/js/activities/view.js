var activityBody = undefined; //TODO rimuovere

$(document).ready(function () {
    initToken();
    initTranslation();

    addEventListener('promotionLanguageManagerInitialized', function (e) {
        if(typeof activityId != "undefined") {    
            doView(activityId);
        }
        else { //new activity
            newActivity();
        }
    }, false); 
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
            common.isAdmin(admins, function(auths){
                if(auths.isAuth || auths.isSuperAdmin) {
                    _form_ds.htplAdmin = Handlebars.compile($("#htpl-admin").html());
                    _form_ds.admins = _form_ds.admins.concat(spliceOwner(admins));

                    getActivityList(auths.uid, function(list) {
                        if(list.length > 0) {
                            $("#myActList").show();
                            for(var i=0; i<list.length;i++) {
                                initTitleJsonMultilanguage(list[i].name, "ac" + i);
                                
                                $("#myActList").append("<option value='" + list[i]._id + "'" +
                                (list[i]._id == activityBody._id ? " selected" : "") + ">" + i18next.t("ac"+i+".title") +"</option>")
                            }

                            $("#myActList").change(function() {
                                window.location.href = config.contentUIUrl + '/activities/' + this.value
                            })
                        }
                    })

                    getAdmins(_form_ds.admins, renderAdmins);
                    $(".viewonly").hide();
                    $(".loggedonly").show()
                    if(auths.uid == activityBody.owner || auths.isSuperAdmin) $(".owner").show();
                    if(auths.isSuperAdmin) {
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
                    $(".owner").hide();
                    $(".loggedonly").hide();
                    $(".viewonly").show();
                }
            });
        }
    });
}

function getActivityList(uid, cb) {
    $.ajax({
        url: contentUrl + "search?t=contents&by_uid=" + uid,
        headers: {
            Authorization: "Bearer " + userToken
        },
        success: function(d){
            if(cb) cb(d.contents);
        },
        error: function(e) {
            console.log(e)
            if(e.status == 423) {
                cb(null)
            }
            _growl.error({message: "Error getting user info"});
        }
    });
}


function getContent(aid, cb) {
    $.ajax({
        url: config.contentUIUrl + "/activities/activitycontent/" + aid,
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
        //name:activityBody.name,
        //description:common.markup(activityBody.description),
        idcontent: activityBody._id,
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
        model.images.push(common.normalizeImgUrl(imgsrc)|| config.contentUIUrl + "/assets/img/demo.jpg");
    }
    common.getPromotions(function(promos) {
        //console.log(promos)
        for(var i=0; i<promos.length; i++) {
            initTitleJsonMultilanguage(promos[i].name, promos[i]._id);
            initDescriptionJsonMultilanguage(promos[i].description, promos[i]._id, 200);
            promos[i].promoLangId = promos[i]._id;
            if(promos[i].images.length == 0)
                promos[i].images.push(config.contentUIUrl + "/img/no_image_available_175.png")
        }
        model.promos = promos;
        
        initTitleJsonMultilanguage(activityBody.name, "activitycontent");
        initDescriptionJsonMultilanguage(activityBody.description, "activitycontent");
        $("#viewbox").html(viewTpl(model));
        initMap(activityBody.name, activityBody.lat, activityBody.lon);
        $('body').localize();

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
        initAutocompletePlaces();
        
        $("#addContentButton").off("click");
        $("#addContentButton").click(function(e) { 
            addContent(); 
        });

        $("input[type='url']").focus(function() {
            var v = $(this).val();
            if(!v.startsWith("http"))
                $(this).val("http://" + v) 
        });

        $("#fileUpload").on("change", function() {
            loadImagePreview(this);
        });

        initMultilanguage();
        $("#f_name").focusout(function() {
            getmultilanguageTitle(this.value);
        })
        $("#f_description").focusout(function() {
            getmultilanguageDescription(this.value);
        })
    });
}