var _PromoRowHlb = undefined; 

$(document).ready(function() {
	_PromoRowHlb = Handlebars.compile($("#entry-template").html());

	$("#list").on("pagecreate", function() {
		var firstActivity = $("#activities option").filter(":selected").val();
		getPromos(firstActivity, renderPromoAndEvent);
	})

    $("#activities").change(function() {
    	getPromos(this.value, renderPromoAndEvent);
    })

	$("#map.ui-header").ready(function() {
		ScaleContentToDevice();
	})

})


$( document ).on( "pageshow", "#position", function() {
	initMap({lat: 38.990263, lng: 8.9356088})	
});



function ScaleContentToDevice(){    
    var header = $(".ui-header").height() + $(".ui-header").outerHeight();
    var content = $.mobile.getScreenHeight() - header;
    $("#map").height(content);
}


 function initMap(center) {
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: center,
      fullscreenControl: false
    });
    var marker = new google.maps.Marker({
      position: center,
      map: map
    });
    return map;
  }





function renderPromoAndEvent(data) {
	hlbRenderPromo(data);
}


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
	for(var i=0; i<promos.length; i++) {
		var d = promos[i].startDate;
		promos[i].startDate = moment(d).format("DD/MM/YYYY")
		d = promos[i].endDate;
		promos[i].endDate = moment(d).format("DD/MM/YYYY");
	}

	$("#promolist").empty();
	$("#promolist").append(_PromoRowHlb({promos:promos}));
	$("#promolist").listview('refresh');

    // Swipe to remove list item
    $( document ).on( "swipeleft swiperight", "#promolist li", function( event ) {
        var listitem = $( this ),
            // These are the classnames used for the CSS transition
            dir = event.type === "swipeleft" ? "left" : "right";
                        
        confirmAndDelete( listitem );
    });
}


function confirmAndDelete( listitem ) {
	// Highlight the list item that will be removed
	listitem.children( ".ui-btn" ).addClass( "ui-btn-active" );
	// Inject topic in confirmation popup after removing any previous injected topics
	$( "#confirm .topic" ).remove();
	listitem.find( ".topic" ).clone().insertAfter( "#question" );
	// Show the confirmation popup
	$( "#confirm" ).popup( "open" );
	// Proceed when the user confirms
	$( "#confirm #yes" ).on( "click", function() {

		//TODO chiamare backend!!!!!!!!

		listitem.remove();
		$( "#promolist" ).listview( "refresh" );
	});
	// Remove active state and unbind when the cancel button is clicked
	$( "#confirm #cancel" ).on( "click", function() {
		listitem.children( ".ui-btn" ).removeClass( "ui-btn-active" );
		$( "#confirm #yes" ).off();
	});
}

