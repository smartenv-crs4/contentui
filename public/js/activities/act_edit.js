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
    initMapEdit(activityBody.lat, activityBody.lon);
})

$("#undoedit").click(function() {    
    $(".insertmode").hide();
    $(".editmode").hide();
    $(".viewmode").show();
    $(".loggedonly").show();
});