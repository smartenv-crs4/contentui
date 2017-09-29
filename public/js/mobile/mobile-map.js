$("#map.ui-header").ready(function() {
	ScaleContentToDevice();
})

$(document).on( "pageinit", function() {
	initMap({lat:39.2306248,lng:9.2065204});
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
		fullscreenControl: false,
		streetViewControl: false
    });
    var marker = new google.maps.Marker({
      position: center,
      map: map
	});

	map.addListener('click', function(e) {
		//updateFormPosition(e.latLng.lat(), e.latLng.lng());
		marker.setPosition(e.latLng);
	});
}