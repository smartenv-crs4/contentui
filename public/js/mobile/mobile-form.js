///////////////////////////
//pars:  _Avtivity
///////////////////////////
var _Activity = undefined

$(document).ready(function() {
	$("#map.ui-header").ready(function() {
		ScaleContentToDevice();
	})
})

$(document).on( "pagecreate", function() {
	_Activity = JSON.parse(sessionStorage._Activity);
	updateFormPosition(_Activity.position.lat, _Activity.position.lng);
	$("#saveBtn").off("click").on("click", function(event) {
        var formFields = ["#title", "#desc", "#sdate", "#edate"];
        event.stopImmediatePropagation();
        
        if(!validateForm(formFields)) {
            $("#savePopup p").html("<span style='color:red;'>Check your data!</span>")
            $("#savePopup").popup("open");
        }
        else {
            resetFieldStyle(formFields);
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
                    $("#savePopup").popup("open");
                },
                error:function(e) {
                    $("#savePopup p").html("<span style='color:red;'>A server error has occurred!</span>")
                    $("#savePopup").popup("open");
                    //console.log(e)
                }
            });
        }
	})

	$("#savePopup button").off("click").on("click", function(event) {
		event.stopImmediatePropagation();
		$("#savePopup").popup("close");
	})
})

$("#sdate").change(function() {
	$("#edate").attr("min",$(this).val())
})

$("#edate").change(function() {
	$("#sdate").attr("max",$(this).val())
})

$(document).on( "pageshow", "#position", function() {
	initMap(_Activity.position);
});

$(document).on( "pageshow", "#form", function() {
	$("#actName").html(_Activity.name);	
	updateAddress();
});

///////////////////////////////
// FUNCTIONS
///////////////////////////////
function validateForm(a) {
    var valid = true;
    a.forEach(function(sel) {
        if(!$(sel)[0].checkValidity()) {
            valid = false;
            $(sel).css("border", "1px solid red");
        }
    });
    return valid;
}

function resetFieldStyle(a) {
    a.forEach(function(sel) {
        $(sel).css("border", "inherit");
    });
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

function updateAddress() {
	geocode(function(adr) {
		$("#address").html(adr);
		$("input#adr").val(adr)
	});
}

function resetForm() {
	$("#sdate").attr("max","");
	$("#edate").attr("min","");
	$("#pform").get(0).reset()
	updateFormPosition(_Activity.position.lat, _Activity.position.lng);
	updateAddress();
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