var _PromoRowHlb = undefined;
var _ActRowHlb = undefined;
var _Pos = undefined;
var _Activity = undefined;

$(document).ready(function() {
	_PromoRowHlb = Handlebars.compile($("#entry-template").html());
	_ActRowHlb = Handlebars.compile($("#act-template").html());
})

//wa to show map with the right size
$("#map.ui-header").ready(function() {
	ScaleContentToDevice();
})

$(document).on( "pageinit", "#list", function() {
	get("/mobile/activities/", undefined, function(data) {
		_Pos = {lat:data[0].lat, lng:data[0].lon}
		$("#activities").html(_ActRowHlb({activities:data}));
		if($("#activities").data("selectmenu") === undefined)
			$("#activities").selectmenu();
		$("#activities").selectmenu("refresh", true);

		var act = $("#activities option").filter(":selected");
		_Activity = {id:$(act).val(), name:$(act).text()};
		get("/mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);

		$("#activities").change(function() {
			_Activity = {id:this.value, name:this.options[this.selectedIndex].innerHTML};
			var p = $(this).find("option").filter(":selected").attr("data-pos").split(","); 
			_Pos = {lat:Number(p[0]), lng:Number(p[1])};
			updateFormPosition(_Pos.lat, _Pos.lng);			
			get("/mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);
		})
	});
});



$(document).on( "pageinit", "#form", function() {
	updateFormPosition(_Pos.lat, _Pos.lng);
	$("#saveBtn").click(function() {
		var stdate = $("input#sdate").val() == '' ? undefined : $("input#sdate").val();
		var enddate = $("input#edate").val() == '' ? undefined : $("input#edate").val();
		var promo = {
			title: $("#title").val(),
			desc: $("#desc").val(),
			price: Number($("#price").val()),
			lat: Number($("input#lat").val()),
			lon: Number($("input#lon").val()),
			address: $("input#adr").val()
		}
		if(stdate) promo.startDate = stdate;
		if(enddate) promo.endDate = enddate;
		
		$.ajax({
			type: "POST",
			url: "/mobile/save/" + _Activity.id,
			data: promo,
			dataType: "JSON",
			success: function(d) {
				resetForm();
				$("#savePopup p").html("Your promo has been saved!")
				$("#savePopup button").attr("data-op-success", "true")
				$("#savePopup").popup("open");
			},
			error:function(e) {
				$("#savePopup p").html("<span style='color:red;'>An error has occurred!</span>")
				$("#savePopup button").attr("data-op-success", "false")
				$("#savePopup").popup("open");		
				//console.log(e)
			}
		});
	})

	$("#savePopup button").click(function(event) {
		$("#savePopup").popup("close");
		if($("#savePopup button").attr("data-op-success") == "true")
			$(":mobile-pagecontainer").pagecontainer( "change", "#list");
	})
})

$(document).on( "pagebeforeshow", "#list", function() {
	if(_Activity)
		get("/mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);
});

$(document).on( "pageshow", "#position", function() {
	initMap(getPos())
});

$(document).on( "pageshow", "#form", function() {
	$("#actName").html(_Activity.name);	
	geocode(function(adr) {
		$("#address").html(adr);
		$("input#adr").val(adr)
	})
});


///////////////////////////////
// FUNCTIONS
///////////////////////////////
function getPos() {
	return {
		lat: Number(document.getElementById("lat").value),
		lng: Number(document.getElementById("lon").value)
	}
}

function updateFormPosition(lat, lon) {
	document.getElementById("lat").value = lat;
	document.getElementById("lon").value = lon;
}

function resetForm() {
	$("#pform").get(0).reset()
	updateFormPosition(_Pos.lat, _Pos.lng);
}

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
		updateFormPosition(e.latLng.lat(), e.latLng.lng());
		marker.setPosition(e.latLng);
	});
}


function geocode(cb) {
	var query = $("input#lat").val() + ',' + $("input#lon").val();
	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + query + "&key=AIzaSyD7svax8fUAqTVVvtjynvTAf105rMbEEsQ";
	get(url, undefined, function(data) {
		if(cb) {
			if(data.status == "OK")
				cb(data.results[0].formatted_address);
			else cb(query);
		}
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
		$.ajax({
			type: "DELETE",
			url: "/mobile/delete/" + _Activity.id + "/" + listitem.attr("data-pid"),
			dataType: "JSON",
			success: function(d) {
				listitem.remove();
				$( "#promolist" ).listview( "refresh" );
			}
		});
	});
	// Remove active state and unbind when the cancel button is clicked
	$( "#confirm #cancel" ).on( "click", function() {
		listitem.children( ".ui-btn" ).removeClass( "ui-btn-active" );
		$( "#confirm #yes" ).off();
	});
}

