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

function showToolShips() {
    var ships = ["Costa Crociere - Costa Diadema", "MSC Crociere - MSC Armonia"]

    $('#toolNavi').toggle();


    $('#toolNavi .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'ships',
        source: substringMatcher(ships)
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