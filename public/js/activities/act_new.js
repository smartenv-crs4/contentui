$(document).ready(function () {
    initToken();
    _form_ds.htplAdmin = Handlebars.compile($("#htpl-admin").html());

    loadContent(function() {
        $(".viewmode").hide();
        $(".editmode").hide();
        $(".insertmode").show();
        initMapEdit();

        $(".headline h3").html("Inserimento Attivit&agrave;")
        
        $("#addContentButton").off("click");
        $("#addContentButton").click(function(e) { 
            addContent(); 
        });

        $("#fileUpload").on("change", function() {
            loadImagePreview(this);
        });
    });
});