var _PromoRowHlb = undefined; 

$(document).ready(function() {
	_PromoRowHlb = Handlebars.compile($("#entry-template").html());
    var firstActivity = $("#activities option").filter(":selected").val();

    getPromos(firstActivity, hlbRenderPromo);

    $("#activities").change(function() {
    	getPromos(this.value, hlbRenderPromo);
    })

    //_PromoRowHlb(hcontext)
})


function getPromos(cid, cb) {
	$.ajax({
        url: "/mobile/promos/?cid=" + cid,
        cache: false,
        type: 'GET',
        success: function(data){        	        	
            if(cb) cb(data);
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function hlbRenderPromo(promos) {
	$("#promolist").empty();
	if(promos.length == 0) {
		$("#promolist").append("<h4 style='text-align:center;margin:30px 0;'>Non sono presenti promozioni o eventi</h4>")
		$("#promolist").append("<p style='text-align:center;'><button type='button' class='btn btn-info btn-lg'><i class='glyphicon glyphicon-plus'></i> Aggiungi</button></p>")
	}
	else {
		for(var i=0; i<promos.length; i++) {
			var d = promos[i].startDate;
			promos[i].startDate = moment(d).format("DD/MM/YYYY")
			d = promos[i].endDate;
			promos[i].endDate = moment(d).format("DD/MM/YYYY");
		}
		$("#promolist").append(_PromoRowHlb({promos:promos}));
	}
}