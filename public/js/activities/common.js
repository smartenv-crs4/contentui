var common = {
    getPromotions: function getPromotions() {
        var source = $("#promo-template").html();
        promoHtpl = Handlebars.compile(source);

        $.ajax({
            url: contentUrl + "contents/" + activityBody._id+"/promotions/",
            type: 'GET',
            success: function(data){
                var promos = data.promos;
                $("#promoList").append(promoHtpl({promos:promos}));
            },
            error: function(e) {
                console.log(e);
            }
        });
    }
}