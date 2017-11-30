$(document).ready(function () {
    initToken();
    initView();
    initAdminTool();
 

    var admins = activityBody.admins;
    admins.push(activityBody.owner);

    $(".editmode").hide();
    $(".insertmode").hide();
    $(".viewmode").show();
    common.isAdmin(admins, function(isAuth){
        if(isAuth) {
            _form_ds.htplAdmin = Handlebars.compile($("#htpl-admin").html());
            _form_ds.admins = _form_ds.admins.concat(spliceOwner(admins));

            getAdmins(_form_ds.admins, renderAdmins);
            $(".viewonly").hide();
            $(".loggedonly").show()
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

    var imgThumb = $("#img-thumb").html();

    $("#imageContainer div").empty();
    for(let i=0; i<activityBody.images.length; i++) {        
        let col = i % 4;
        var imgsrc = activityBody.images[i];
        //TODO nel caso di immagini su uploadms, contentms dovrebbe restituire 
        //solo gli objectid, non gli url già completi
        let img = $(imgThumb).find("img").attr("src", normalizeImgUrl(imgsrc));
        //TODO plugin per scorrere la gallery
        $("#imageContainer div[data-img-thumb-pos='" + col + "\']").append(img).append('<br>'); //.find("img").attr("src", activityBody.images[0]));
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


function normalizeImgUrl(url) {
    /*
    if(isURL(url)) return url;
    else {
        //TODO verificare sia un formato ObjectID valido
        return baseUrl + "activities/image/" + url
    }
    */
    //TODO sostituire con codice sopra dopo modifica contentms
    var ret = url;
    if(url.startsWith(uploadUrl)) {
        var id = url.split('file/')[1];
        ret = baseUrl + "activities/image/" + id;
    }
    return ret;
}


function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
    return pattern.test(str);
}