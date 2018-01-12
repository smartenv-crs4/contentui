var initTools = false; //for calling initAdminTool only once... better way?

$("#editContent").click(function() {
    $(".viewmode").hide();
    $(".insertmode").hide();
    $(".editmode").show();
    if(!initTools) {
        initAdminTool();
        initTools = true;
    }
    //bind only once!!!
    $("#updateContentButton").off("click");
    $("#updateContentButton").click(function(e) {
        updateContent();
    });
    
    $("#fileUpload").on("change", function() {
        loadImagePreview(this);
    });

    loadContent();
    loadCat(true);
    initMapEdit();
})

$("#undoedit").click(function() {    
    $(".insertmode").hide();
    $(".editmode").hide();
    $(".viewmode").show();
    $(".loggedonly").show();
});

$("#lockContent").click(function() {
    function lockContentCB(d) {
        if(d.published) {
            $(that).addClass("lock");
            $(that).attr("title","lock content")
            $(that).find("i").first().removeClass("fa-lock").addClass("fa-unlock")
        }
        else {
            $(that).removeClass("lock");
            $(that).attr("title","unlock content")
            $(that).find("i").first().removeClass("fa-unlock").addClass("fa-lock")
        }
    }

    var that = this;
    var doLock = $(that).hasClass("lock");
    var reasons = undefined;

    if(doLock) {
        $(this).attr("data-target","#lockmodal");
        $("#lockmail").off("click"); 
        $("#lockmail").click(function() {
            reasons = $("#lockreasons").text();
            
            if(!reasons || reasons.length < 3 )
                _growl.warning({message:"Please give a reason"})
            else {
                sendMail(lockContent(doLock, lockContentCB(d)));
            }
        })
    }
    else lockContent(doLock, lockContentCB(d));
})


function sendMail(cb) {
    //call ajax for mail
    cb();
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