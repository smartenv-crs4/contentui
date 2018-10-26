var initTools = false; //for calling initAdminTool only once... better way?

function initToolbar() {
    common.getPromotions(renderPromoList);

    $("#editContent").click(function() {
        $(".viewmode").hide();
        
        if(!initTools) {
            initAdminTool();
            initTools = true;
        }

        loadContent(function() {
            $(".insertmode").hide();
            $(".editmode").show();
            initMapEdit();
            initAutocompletePlaces();
            //bind only once!!!
            $("#updateContentButton").off("click");
            $("#updateContentButton").click(function(e) {
                updateContent();
            });
/*
            $("input[type='url']").focus(function() {
                var v = $(this).val();
                if(!v.startsWith("http"))
                    $(this).val("http://" + v) 
            });
*/
            //http must be set here, not in the backend, to ensure html5 validation
            $("input[type='url']").focusout(function() {
                var v = $(this).val();
                if(v.length > 0 && !v.startsWith("http"))
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
            
            initTranslation();
        });
    })

    $("#addActivity").click(function() {
        window.location.href = baseUrl + "activities/new";
    });

    $("#addPromo, #addPromoTop").click(function() {
        window.location.href = baseUrl + "activities/" + activityBody._id + "/promotions/new";
    });

    $('#addPromotionButton').off("click");
    $('#addPromotionButton').click(function(e) { addPromotion(); });  //perchè è qui???

    $("#undoedit").click(function() {    
        $(".insertmode").hide();
        $(".editmode").hide();
        $(".viewmode").show();
        $(".loggedonly").show();
    });
    
    $("#lockContent").click(function() {
        function lockContentCB(d) {
            if(d.published) {
                $("#lockContent").addClass("lock");
                $("#lockContent").attr("title","lock content")
                $("#lockContent").find("i").first().removeClass("fa-lock").addClass("fa-unlock")
            }
            else {
                $("#lockContent").removeAttr("data-target");
                $("#lockContent").removeClass("lock");
                $("#lockContent").attr("title","unlock content")
                $("#lockContent").find("i").first().removeClass("fa-unlock").addClass("fa-lock")
            }
        }

        var doLock = $(this).hasClass("lock");
        var reasons = undefined;

        if(doLock) {
            $(this).attr("data-target","#lockmodal");
            $("#lockmail").off("click"); 
            $("#lockmail").click(function() {
                reasons = $("#lockreasons").val();
                $("#lockreasons").val("");
                
                if(!reasons || reasons.length < 3 )
                    _growl.warning({message:"Please give a reason"})
                else {
                    //lockContent(doLock, lockContentCB)
                    
                    sendMail(reasons, function() {
                        lockContent(doLock, lockContentCB)
                    });
                }
            })
        }
        else lockContent(doLock, lockContentCB);
    })

    $("#delContent").click(function() {        
        bootbox.confirm({
            title: i18next.t("activity.delConfirmTitle"),
            message: i18next.t("activity.delConfirmDesc"),
            callback: function(result){
                if(result)   {
                    $.ajax({
                        url: baseUrl + "activities/" + activityBody._id,
                        method: 'DELETE',
                        headers: {
                            Authorization: "Bearer " + userToken
                        },
                        success: function(){
                            _growl.notice({message: "Content Deleted"});
                            window.setTimeout(function() {
                                window.location.href = baseUrl
                            }, 2000);
                        },
                        error: function(e) {
                            console.log(e);
                            _growl.error({message: "Error deleting content"});
                        }
                    });
                }
            }
        })
    })
}

function sendMail(msg, cb) {
    $.ajax({
        url: baseUrl + "activities/email",
        method: 'POST',
        headers: {
            Authorization: "Bearer " + userToken
        },
        data: {
            oid: activityBody.owner,
            cid: activityBody._id,
            msg: msg
        },
        success: function(){
            if(cb) cb();
        },
        error: function(e) {
            console.log(e);
            _growl.error({message: "Error locking content"});
        }
    });
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
            _growl.notice({message:"Content successfully " + (lock ? "locked" : "unlocked")});
            if(cb) cb(d);
        },
        error: function(e) {
            console.log(e);
            _growl.error({message: "Error locking content"});
        }
    });
}

function renderPromoList(promos) {
    for(var i=0; i<promos.length; i++) {
        initTitleJsonMultilanguage(promos[i].name, promos[i]._id);
        initDescriptionJsonMultilanguage(promos[i].description, promos[i]._id, 200);
        
        promos[i].promoLangId = promos[i]._id
    }
    var source = $("#promo-template").html();
    promoHtpl = Handlebars.compile(source);
    $("#promoList").html(promoHtpl({promos:promos, idcontent:activityBody._id}));
}


function initMultilanguage(){
    lang=window.localStorage.lng;
    // lang=$('#multilanguageselect').get(0).value;

    $('#multilanguageselect').change(function() {
        lang=this.value;

        // console.log("Language:--->"+ lang);
        // console.log(titleMultilanguage[lang]);
        if(!(titleMultilanguage[lang]))
            titleMultilanguage[lang] = "";

        if(!(descriptionMultilanguage[lang]))
            descriptionMultilanguage[lang] = "";

        $('#f_name').val(titleMultilanguage[lang]);
        $('#f_description').val(descriptionMultilanguage[lang]);

    });

    $('#multilanguageselect').val(window.localStorage.lng).change();
}

function initAutocompletePlaces() {
    function cb() {
        var place = autocomplete.getPlace();
        if (!place || !place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            /*
            var name = place ? place.name : $("#f_address").val();
            window.alert("No details available for input: '" + name + "'");*/
            return;
        }
        _addressFound = document.getElementById('f_address').value;
        _form_ds.lat = place.geometry.location.lat();
        _form_ds.lon = place.geometry.location.lng();
        _map.markers[0].setPosition(place.geometry.location);
        _map.setCenter(_form_ds.lat, _form_ds.lon)   
    }
    _addressFound = undefined;
    var input = document.getElementById('f_address');  
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', cb);   
}