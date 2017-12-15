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
    lockContent(doLock, function(d) {
        if(d.published) {
            $(that).addClass("lock");
            $(that).attr("title","lock content")
            $(that).find("i").first().removeClass("fa-unlock").addClass("fa-lock")
        }
        else {
            $(that).removeClass("lock");
            $(that).attr("title","unlock content")
            $(that).find("i").first().removeClass("fa-lock").addClass("fa-unlock")
        }
    });
})

$("#undoedit").click(function() {    
    $(".insertmode").hide();
    $(".editmode").hide();
    $(".viewmode").show();
    $(".loggedonly").show();
});