//////////////////////////////////////
//pars:  _Avtivity in sessionStorage
//////////////////////////////////////
var _Activity = undefined;
var _Address = undefined;
var _Pos = undefined;
var _Town = undefined;
var _Auth = (sessionStorage.auth) ? JSON.parse(sessionStorage.auth) : {};

$(document).ready(function() {
	$("#map.ui-header").ready(function() {
		ScaleContentToDevice();
	})
})

$(document).on( "pagecreate", function() {
	_Activity = JSON.parse(sessionStorage._Activity);
    updateFormPosition(_Activity.position.lat, _Activity.position.lng);
    
    get("../promotypes", undefined, function(data) {
        $("#promotypes").empty();
        data.forEach(function(v, i) {            
            $("#promotypes").append("<option value='" + v._id + "' " + (i == 0 ? "selected" : "") + ">" + v.name + "</option>")
        });
        if($("#promotypes").data("selectmenu") === undefined)
            $("#promotypes").selectmenu();
        $("#promotypes").selectmenu("refresh", true);
    })

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
                type: $("#promotypes option").filter(":selected").val(),
                title: $("#title").val(),
                desc: $("#desc").val(),
                price: Number($("#price").val()),
                lat: _Pos.lat,
                lon: _Pos.lng,
                address: _Address,
                town: _Town
            }
            if(stdate) promo.startDate = moment(stdate).utc();
            if(enddate) promo.endDate = moment(enddate).utc();
            
            $.ajax({
                type: "POST",
                url: "../save/" + _Activity.id,
                data: promo,
                headers: {Authorization: "Bearer " + _Auth.token},
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
	return _Pos
}

function updateFormPosition(lat, lon) {
	_Pos = {lat: lat, lng:lon};
}

function updateAddress() {
	geocode(function(adr, town) {
        $("#address").html(adr);
        _Address = adr;
        _Town = town;
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
	var query = _Pos.lat + ',' + _Pos.lng;
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + 
                query + "&key=AIzaSyD7svax8fUAqTVVvtjynvTAf105rMbEEsQ";
	get(url, undefined, function(data) {
		if(cb) {
            if(data.status == "OK") {
                cb(data.results[0].formatted_address, getTown(data.results[0]));
            }
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

function getTown(a) {
    var items = a.address_components;
    for(var i = 0; i<items.length; i++) {
        //esiste un modo piu' efficace?
        if(items[i].types.indexOf("locality") != -1 || items[i].types.indexOf("administrative_area_level_3") != -1) {
            return items[i].long_name
        }
    }
}