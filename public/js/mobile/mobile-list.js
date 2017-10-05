var _PromoRowHlb = undefined;
var _ActRowHlb = undefined;
var _Activity = (sessionStorage._Activity) ? JSON.parse(sessionStorage._Activity) : {};


$(document).ready(function() {
	_PromoRowHlb = Handlebars.compile($("#entry-template").html());
	_ActRowHlb = Handlebars.compile($("#act-template").html());
})

$(document).on( "pageinit", function() {
	get("mobile/activities", undefined, function(data) {
		$("#activities").html(_ActRowHlb({activities:data}));
		
		if(_Activity.id)
			$('#activities option[value='+_Activity.id+']').attr('selected','selected');
		else
			$('#activities option:first').attr('selected','selected');	

		if($("#activities").data("selectmenu") === undefined)
			$("#activities").selectmenu();
		$("#activities").selectmenu("refresh", true);

		var act = $("#activities option").filter(":selected");
		var p = $(act).attr("data-pos").split(",");
		_Activity.id = $(act).val();
		_Activity.name = $(act).text();
		_Activity.position = {lat:Number(p[0]), lng:Number(p[1])};
		get("mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);

		$("#activities").change(function() {
			var p = $(this).find("option").filter(":selected").attr("data-pos").split(","); 
			_Activity.id = this.value;
			_Activity.name = this.options[this.selectedIndex].innerHTML;
			_Activity.position = {lat:Number(p[0]), lng:Number(p[1])};
			get("mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);
		})
	});
});

$(document).on( "pagebeforeshow", function() {
	if(_Activity.id) {
		$('#activities option[value='+_Activity.id+']').attr('selected','selected');
		get("mobile/promos/", {name:"cid", value:_Activity.id}, renderPromoAndEvent);
	}
});

$("#goForm").off("click").on("click", function(event) {
	event.stopImmediatePropagation();
	sessionStorage._Activity = JSON.stringify(_Activity);
})

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
	$( "#confirm #yes" ).off("click").on( "click", function() {
		$.ajax({
			type: "DELETE",
			url: "mobile/delete/" + _Activity.id + "/" + listitem.attr("data-pid"),
			dataType: "JSON",
			success: function(d) {
				listitem.remove();
				$( "#promolist" ).listview( "refresh" );
			}
		});
	});
	// Remove active state and unbind when the cancel button is clicked
	$( "#confirm #cancel" ).off("click").on( "click", function() {
		listitem.children( ".ui-btn" ).removeClass( "ui-btn-active" );
		$( "#confirm #yes" ).off();
	});
}

