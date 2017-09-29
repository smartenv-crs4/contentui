var _PromoRowHlb = undefined;
var _ActRowHlb = undefined;
var _Pos = undefined;
var _Activity = undefined;

$(document).ready(function() {
	_PromoRowHlb = Handlebars.compile($("#entry-template").html());
	_ActRowHlb = Handlebars.compile($("#act-template").html());
})

$(document).on( "pageinit", function() {
    console.log("init list")
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
			get("/mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);
		})
	});
});

$(document).on( "pageshow", function() {
    if(_Activity)
	    get("/mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);
});


///////////////////////////////
// FUNCTIONS
///////////////////////////////
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

