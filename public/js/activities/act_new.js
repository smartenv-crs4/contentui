$(document).ready(function () {
    initToken();
    _form_ds.htplAdmin = Handlebars.compile($("#htpl-admin").html());
    
    $(".viewmode").hide();
    $(".editmode").hide();
    $(".insertmode").show();
    $(".headline h3").html("Inserimento Attivit&agrave;")

    $("#addContentButton").click(function(e) { addContent(); });
    $("#fileUpload").change(function() { loadImagePreview(this); });
            

    loadCat(true);
    initMapEdit();
});