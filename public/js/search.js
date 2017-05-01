var searchItemTemplate = undefined;
var searchTemplate = undefined;

$(document).ready(function() {
    var source   = $("#entry-template").html();
    searchItemTemplate = Handlebars.compile(source);

    source = $("#categories").html();
	searchTemplate = Handlebars.compile(source);

	loadSearch();
});

$('body').on('keypress', "#qt", function(args) {
    if (args.keyCode == 13) {
        $('#doSearch').click();
        return false;
    }
});


function getShips(cb) {
    $.ajax({
        url: "http://smartenv.crs4.it/schedule/ships",
        cache: false,
        type: 'GET',
        success: function(data){
            var ships = [];
            Object.keys(data).forEach(function(k,i) {
                ships.push(data[k].company + ' - ' + data[k].name);
            });
            if(cb) cb(ships);
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function showToolShips() {
    getShips(function(ships) {
        var input = document.createElement("input");
        $(input).addClass("typeahead form-control cp-autocomplete");
        $(input).attr("placeholder","Nome nave");
        $('#advtool').empty();
        $('#advtool').toggle();
        $('#advtool').append(input);

        $('#advtool .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'ships',
            source: substringMatcher(ships)
        });

        $("#advtool .typeahead").on("typeahead:select", function() {
            
        })
    });
}



var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};



function loadSearch() {    
    $.ajax(contentsUrl + "categories/")
	.done(function(data) {
	    var hcontext = {cats:data.categories};
        $("#searchBox #categoriesDrop ul").append(searchTemplate(hcontext));
	})
}


function search() {
    var q = $("#qt").val();
    $.ajax(baseUrl + 'search?q=' + q)
    .done(function(data) {
        $("#tot").html(data.metadata.totalCount);
        $("#searchresults").empty();
        $.each(data.contents, function(i, item) {
            var hcontext = {
                contentid: item._id,
                title: item.name,
                description: item.description
            };
            $("#searchresults").append(searchItemTemplate(hcontext));
        });
    });
}