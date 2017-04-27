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