$("#editContent").click(function() {
    $(".viewmode").hide();
    $(".insertmode").hide();
    $(".editmode").show();
    
    //bind only once!!!
    $("#updateContentButton").one("click", function(e) {
        updateContent();
    });
    
    $("#fileUpload").on("change", function() {
        loadImagePreview(this);
    });

    loadContent();
    loadCat(true);
    initMapEdit();
})


    $("#lockContent").click(function() {
        var that = this;
        var doLock = $(that).hasClass("lock");
        var reasons = undefined;

        if(doLock) { //TODO FIX EVENTSSSS!!!!!
            $(this).attr("data-target","#lockmodal");
            $("#lockmail").off("click"); 
            $("#lockmail").click(function() {
                reasons = $("#lockreasons").text();
                
                if(!reasons || reasons.length < 3 )
                    _growl.warning({message:"Please insert a reason"})
            })
        }
        //modal email
        //if mail content
        //then lock
            //then email
        //else growl insert cause
        /*
        lockContent(doLock, function(d) {
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

        });
        */

    })


$("#undoedit").click(function() {    
    $(".insertmode").hide();
    $(".editmode").hide();
    $(".viewmode").show();
    $(".loggedonly").show();
});

function sendMail() {
    //
}