$(document).ready(function () {
    initToken();
    initView();
    initAdminTool();
 
    var admins = activityBody.admins;
    admins.push(activityBody.owner);

    $(".editmode").hide();
    $(".insertmode").hide();
    $(".viewmode").show();
    common.isAdmin(admins, function(isAuth, isSAdmin){
        if(isAuth) {
            _form_ds.htplAdmin = Handlebars.compile($("#htpl-admin").html());
            _form_ds.admins = _form_ds.admins.concat(spliceOwner(admins));

            getAdmins(_form_ds.admins, renderAdmins);
            $(".viewonly").hide();
            $(".loggedonly").show()
            if(isSAdmin) $(".sadmin").show()
        }
        else {
            $(".loggedonly").hide();
            $(".viewonly").show();
        }
    });
});

function initView() {
    $("#name").text(activityBody.name);
    $("#description").text(activityBody.description);
    
    $('#addPromotionButton').one("click", function(e) { addPromotion(); });

    var imgThumb = Handlebars.compile($("#htpl-img").html());

    $("#imageContainer").empty();
    for(let i=0; i<activityBody.images.length; i++) {        
        let col = i % 4;
        var imgsrc = activityBody.images[i];
        //TODO nel caso di immagini su uploadms, contentms dovrebbe restituire 
        //solo gli objectid, non gli url già completi
        //TODO plugin per scorrere la gallery
        //$("#imageContainer div[data-img-thumb-pos='" + col + "\']").append(img).append('<br>');
        $("#imageContainer").append(imgThumb({src:normalizeImgUrl(imgsrc)||"assets/img/demo.jpg"}));
    }
    var catBox = $("#cp-cats").html();
    $("#catDrop div").empty();
    for(let i=0; i<activityBody.category.length; i++) {
        $.ajax(contentUrl + "categories/"+activityBody.category[i])
        .done(function(cat) {
            var col = i%4;
            $("#catDrop div[data-cp-cbox-pos='" + col + "\']").append($(catBox).append(cat.name));
        })
    }
    initMap(activityBody.name, activityBody.description, activityBody.lat, activityBody.lon);
    common.getPromotions();
}