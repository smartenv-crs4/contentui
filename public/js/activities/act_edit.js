$("#editContent").click(function() {
    $(".viewmode").hide();
    $(".insertmode").hide();
    $(".editmode").show();
    $("#updateContentButton").one("click", function(e) {
        updateContent();
    });
    $("#fileUpload").one("change", function() { loadImagePreview(this); });

    loadContent();
    loadCat(true);
    initMapEdit(activityBody.lat, activityBody.lon);
})