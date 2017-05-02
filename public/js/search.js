var _searchItemTemplate = undefined;
var _searchTemplate = undefined;
var _filters = {
    sdate: undefined,
    edate: undefined,
    category: undefined
};

$(document).ready(function() {
    var source   = $("#entry-template").html();
    _searchItemTemplate = Handlebars.compile(source);

    source = $("#categories").html();
	_searchTemplate = Handlebars.compile(source);

    $("#doSearch").click(function(e) {
        search();
    })

    $("#doAdv").click(function(e) {
        if($("#adv").is(":visible")) {            
            resetFilters();
            resetAdvTool();
            $("#advMenu").empty();
            $("#adv").hide();
        }
        else {
            $("#adv").show();
            $('#advMenu').html($("#cp-advmenu").html())
            loadCat();
            $("#advMenu .dropdown-menu a").click(function(e) {
                var t = this.getAttribute('data-cp-tm');
                switch(t) {
                    case 'd-ship':
                        showToolShips();
                        break;
                    case 'd-int':
                        showToolDates();
                        break;
                    case 'd-today':
                        setFilterDates(new Date(), new Date(moment().endOf('day')));
                        break;
                    case 'd-tom':
                        setFilterDates(new Date(moment().add(1, 'day').startOf('day')), new Date(moment().add(1,'day').endOf('day')));
                        break;
                    default:
                        break;
                }
            })
        }
    })

});

$('body').on('keypress', "#qt", function(args) {
    if (args.keyCode == 13) {
        $('#doSearch').click();
        return false;
    }
});



function resetFilters() {
    Object.keys(_filters).forEach(function(k,i) {
        _filters[k] = undefined;
    })
}

function resetAdvTool(appendSel) {    
    $('.adv').hide();
    $('#advtool').empty();
    if(appendSel) {
        $('#advtool').show();
        $('#advtool').append($(appendSel).html());
    }
    else $('#advtool').hide();
}


function showToolDates() {
    resetAdvTool("#cp-datepicker");
    var opt = {
        format: 'DD/MM/YYYY',
        allowInputToggle: true,
        ignoreReadonly: true
    }
    opt.useCurrent = true;
    $('#dtp1').datetimepicker(opt);
    opt.useCurrent = false;
    $('#dtp2').datetimepicker(opt);

    $("#dtp1").on("dp.change", function (e) {
        $('#dtp2').data("DateTimePicker").minDate(e.date);
    });
    $("#dtp2").on("dp.change", function (e) {
        $('#dtp1').data("DateTimePicker").maxDate(e.date);
    });

    $('#intdates .cp-ok').click(function() {
        var start = $("#dtp1").data("DateTimePicker").date();
        var stop = $("#dtp2").data("DateTimePicker").date();
        if(start && stop) {
            setFilterDates(start.toDate(), stop.toDate());
            resetAdvTool();
        }
        else alert("error in date"); //TODO growl
    })

    $('#intdates .cp-undo').click(function() {
        resetAdvTool();
    })
}


function showToolShips() {
    getShips(function(ships) {
        resetAdvTool("#cp-ac");

        $('#advtool .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'ships',
            source: substringMatcher(ships)
        });

        $("#advtool .typeahead").on("typeahead:select", function(e, o) {
            var namecomp = o.split("-")
            getLastSchedule(namecomp[1].trim(), namecomp[0].trim(), function(last){                
                if(last.ships.length == 1) {
                    var start = new Date(last.ships[0].arrival);
                    var stop = new Date(last.ships[0].departure);                    
                }
                setFilterDates(start, stop);                                
                resetAdvTool();
            });
        })
    });
}

function setFilterDates(start, stop) {
    if(start && stop) {
        var startstr = moment(start).format("D/MM/YYYY");
        var stopstr = moment(stop).format("D/MM/YYYY");
        var intervalstr = (startstr != stopstr) ? startstr + " - " + stopstr : startstr;
        $("#advDate").text(intervalstr);
        _filters.sdate = start;
        _filters.edate = stop;
    }
}

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

function getLastSchedule(name, company, cb) {
    var qs = "?ship=" + name + "&company=" + company;
    qs += "&sdate=" + encodeURIComponent(new Date());
    qs += "&limit=1&ord=asc"

    $.ajax({
        url: "http://smartenv.crs4.it/schedule/schedule" + qs,
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



function loadCat() {    
    $.ajax(contentsUrl + "categories/")
	.done(function(data) {
	    var hcontext = {cats:data.categories};
        $("#searchBox #categoriesDrop ul").append(_searchTemplate(hcontext));
	})
}


function search() {
    var q = $("#qt").val();
    var filterString = '';
    Object.keys(_filters).forEach(function(k,i) {
        if(_filters[k]) filterString += "&" + k + "=" + _filters[k];
    });

    $.ajax(baseUrl + 'search?q=' + q + filterString)
    .done(function(data) {
        $("#tot").html(data.metadata.totalCount);
        $("#searchresults").empty();
        $.each(data.contents, function(i, item) {
            var hcontext = {
                contentid: item._id,
                title: item.name,
                description: item.description
            };
            $("#searchresults").append(_searchItemTemplate(hcontext));
        });
    });
}