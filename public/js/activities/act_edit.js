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
            //bind only once!!!
            $("#updateContentButton").off("click");
            $("#updateContentButton").click(function(e) {
                updateContent();
            });
            
            $("#fileUpload").on("change", function() {
                loadImagePreview(this);
            });
            initTranslation();
        });
    })

    $("#addPromo").click(function() {
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
                console.log(reasons)
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
    var source = $("#promo-template").html();
    promoHtpl = Handlebars.compile(source);
    $("#promoList").html(promoHtpl({promos:promos, idcontent:activityBody._id}));
}