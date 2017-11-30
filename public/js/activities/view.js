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
        console.log("XXXXX: " + activityBody.images[i] + "  " + i)
        let col = i % 4;
        let img = $(imgThumb).find("img").attr("src", activityBody.images[i]);
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