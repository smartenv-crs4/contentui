var _PromoRowHlb = undefined;
var _ActRowHlb = undefined;
var _Pos = undefined;
var _Activity = undefined;

$(document).ready(function() {
	_PromoRowHlb = Handlebars.compile($("#entry-template").html());
	_ActRowHlb = Handlebars.compile($("#act-template").html());

	//wa for selectmenu wrong rendering when refresh on #form page (correct?) 
	//$( ":mobile-pagecontainer" ).pagecontainer( "load", "#list")
	console.log("[" +window.location.hash + "]")
	if(window.location.hash != "#list" && window.location.hash != '') 
		window.location.href = "/mobile";
    $("#activities").change(function() {
		_Activity = {id:this.value, name:this.options[this.selectedIndex].innerHTML};
		var p = $(this).find("option").filter(":selected").attr("data-pos").split(","); 
		_Pos = {lat:Number(p[0]), lng:Number(p[1])};
		get("/mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);
    })

	$("#map.ui-header").ready(function() {
		ScaleContentToDevice();
	})
})

$( document ).on( "pageshow", "#list", function() {
	get("/mobile/activities/", undefined, function(data) {
		_Pos = {lat:data[0].lat, lng:data[0].lon}
		$("#activities").append(_ActRowHlb({activities:data}));
		if($("#activities").data("selectmenu") === undefined)
			$("#activities").selectmenu();
		$("#activities").selectmenu("refresh", true);

		var act = $("#activities option").filter(":selected");
		_Activity = {id:$(act).val(), name:$(act).text()};
		get("/mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);
	});	
});

$( document ).on( "pageshow", "#position", function() {
	initMap(_Pos)	
});

$( document ).on( "pageshow", "#form", function() {
	$("#actName").html(_Activity.name);

	$("#saveBtn").click(function() {
		var promo = {
			title: $("#title").val(),
			desc: $("#desc").val(),
			price: Number($("#price").val()),
			startDate: $("input#sdate").val(),
			endDate: $("input#edate").val(),
			lat: Number(_Pos.lat),
			lon: Number(_Pos.lng),
			address: $("#address").text()
		}
		
		$.ajax({
			type: "POST",
			url: "/mobile/save/" + _Activity.id,
			data: promo,
			dataType: "JSON",
			success: function(d) {
				$("#savePopup p").html("Your promo has been saved!")
				$("#savePopup").popup("open");	
				$( ":mobile-pagecontainer" ).pagecontainer( "change", "#list");
			},
			error:function(e) {
				$("#savePopup p").html("<span style='color:red;'>An error has occurred!</span>")
				$("#savePopup").popup("open");		
				console.log(e)
			}
		});
		
	})
	
	$("#savePopup button").click(function() {
		$("#savePopup").popup("close");
		//TODO back to list page
	})

	geocode(function(adr) {
		$("#address").html(adr);
	})
});


///////////////////////////////
// FUNCTIONS
///////////////////////////////

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
		_Pos = {lat: e.latLng.lat(), lng: e.latLng.lng()};
		marker.setPosition(e.latLng);
	});
}


function geocode(cb) {
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + _Pos.lat + "," + _Pos.lng + "&key=AIzaSyD7svax8fUAqTVVvtjynvTAf105rMbEEsQ";
	get(url, undefined, function(data) {
		if(cb)
		if(data.status == "OK")
			cb(data.results[0].formatted_address);
		else cb(_Pos.lat + ", " + _Pos.lng);
	});
}

function renderPromoAndEvent(data) {
	hlbRenderPromo(data);
}

function get(url, par, cb) {
	$.ajax({
		url: url + (par ? (url.indexOf("?") != -1 ? "&" : "?" ) + par.name + "=" + par.value : ""),
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

