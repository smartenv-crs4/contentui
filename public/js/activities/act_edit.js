$("#editContent").click(function() {
    $(".viewmode").hide();
    $(".insertmode").hide();
    $(".editmode").show();
    $("#updateContentButton").click(function(e) {
        updateContent();
    });
    
    initAdminTool();

    $("#fileUpload").change(function() { loadImagePreview(this); });

    loadContent();
    loadCat(true);
    initMapEdit(activityBody.lat, activityBody.lon);
})