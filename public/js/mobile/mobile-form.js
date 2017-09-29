///////////////////////////
//pars: _Pos _Avtivity
///////////////////////////
var _Activity = {name: undefined, id: undefined};

$(document).on( "pageinit", function() {
	//updateFormPosition(_Pos.lat, _Pos.lng);
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

$(document).on( "pageshow", function() {
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
//	updateFormPosition(_Pos.lat, _Pos.lng);
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