var _searchItemTemplate = undefined;
var _searchTemplate = undefined;
var _mapMarker = undefined;
var _defSliderVal = 500;
var _filters = {
    sdate: undefined,
    edate: undefined,
    category: undefined,
    position: undefined,
    type: 'promo' //TODO tick per ricerca contenuti in adv panel!!!!!!!!
};



$(document).ready(function() {
    initToken();

    var source   = $("#entry-template").html();
    _searchItemTemplate = Handlebars.compile(source);

/*
    $(".wrapper").backstretch([
        "http://smartapi.crs4.it/ui/user/customAssets/img/port/login_1.jpg",
        "http://smartapi.crs4.it/ui/user/customAssets/img/port/login_2.jpg",
        "http://smartapi.crs4.it/ui/user/customAssets/img/port/login_3.jpg",
        "http://smartapi.crs4.it/ui/user/customAssets/img/port/login_8.jpg"
    ], {
        fade: 1000,
        duration: 7000
    });
*/
    showToolShips();
    showToolDates();

    $("#doSearch").click(function(e) {
        search();
    })

    $.ajax({
        cache: false,
        url: 'customAssets/translations/translation.json',
        type:"get",
        contentType:"application/json",
        success: function(data) {
            initDictionary(data,config.commonUIUrl,"promotionLanguageManagerInitialized");
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);
            console.error(thrownError);
        }
    });

    $("#doAdv").click(function(e) {
        if($("#adv").is(":visible")) {
            //resetFilters();
            $("#adv").hide();
        }
        else {
            $("#adv").show();
            loadCat();

            $(".rst").click(function(e) {
                var f=this.getAttribute('data-rst-field');
                e.preventDefault();
                resetFilterField(f)
            })

            $(".advTimeMenu").click(function(e) {
                var t = this.getAttribute('data-cp-tm');
                switch(t) {
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

$("#collapse-Map").on("shown.bs.collapse", function() {
    initMap();
})

$('body').on('keypress', "#qt", function(args) {
    if (args.keyCode == 13) {
        $('#doSearch').click();
        return false;
    }
});


function resetFilterField(field) {
    switch(field) {
        case 'position':
            _filters.position = undefined;
            $("#advPos").empty();
            $('#slider1-value-rounded').text(_defSliderVal); 
            $('#slider1-rounded').slider({value: _defSliderVal})
            break;
        case 'date':
            setFilterDates();
            break;
        case 'category':
            _filters.category = undefined;
            $("#advCat").empty();
            $("#catDrop input:checkbox").prop('checked', false);
            break;
    }
}


function initMap() {
    var lat = (_filters.position ? _filters.position.lat : undefined)||39.213230;
    var lon = (_filters.position ? _filters.position.lon : undefined)||9.105954;

    var map = new GMaps({
        div: '#map',
        scrollwheel: false,
        lat: lat,
        lng: lon,
        zoom: 12,
        click: function (event) {
            var clicklat = event.latLng.lat();
            var clicklon = event.latLng.lng();

            _mapMarker.setPosition(new google.maps.LatLng(clicklat, clicklon));
            _filters.position = {lat: clicklat, lon: clicklon, radius: $('#slider1-rounded').slider("value")};

            gooGeocode(clicklat, clicklon, function(address) {
                $("#advPos").text(address);
            });
        }
    });

    _mapMarker = map.addMarker({
        lat: lat, 
        lng: lon
    });

    addEventListener('zoomMap', function (e) {
        map.setZoom(20);
    }, false);

    var radiusVal = (_filters.position ? _filters.position.radius : undefined)||500;
    $('#slider1-value-rounded').text(radiusVal);
    $('#slider1-rounded').slider({
        value: radiusVal,
        min: _defSliderVal,
        max: 100000,
        step:_defSliderVal,
        slide: function(event, ui) {
            $('#slider1-value-rounded').text(ui.value);
            if(!_filters.position) {
                _filters.position = {
                    lat:lat, 
                    lon:lon, 
                    radius:undefined
                };
                gooGeocode(_filters.position.lat, _filters.position.lon, function(address) {
                    $("#advPos").text(address);
                });
            }
            _filters.position.radius = ui.value;
        }
    });
}

function mapZoom(){
    var event = new Event('zoomMap');
    dispatchEvent(event);
}

function gooGeocode(lat, lng, callback) {
    let geocoder = new google.maps.Geocoder;
    let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    let address = 'Posizione sconosciuta';
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
            if (results[1]) {
                var adrcmp = results[0].address_components;
                address = adrcmp[1].long_name + ', ' + adrcmp[2].long_name;
            } 
            else {
                console.log('No results found');
            }
        } 
        else {
            console.log('Geocoder error: ' + status);
        }
        return callback(address);
    });
}


function resetFilters() {
    Object.keys(_filters).forEach(function(k,i) {
        _filters[k] = undefined;
    })
}


function showToolDates() {    
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
        }
        else $.growl.error({message:"Specificare una data di inizio e una di fine"});
    })

    $('#intdates .cp-undo').click(function() {
        setFilterDates();
    })
}


function showToolShips() {
    getShips(function(ships) {
        $('#collapse-Time .typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        },
        {
            name: 'ships',
            source: substringMatcher(ships)
        });

        $("#collapse-Time .typeahead").on("typeahead:select", function(e, o) {
            var namecomp = o.split("-")
            getLastSchedule(namecomp[1].trim(), namecomp[0].trim(), function(last){                
                if(last.ships.length == 1) {
                    var start = new Date(last.ships[0].arrival);
                    var stop = new Date(last.ships[0].departure);                    
                }
                else $.growl.warning({ message: "Nessun arrivo previsto per la nave selezionata" })
                setFilterDates(start, stop);
            });
        });
    });
}

function setFilterDates(start, stop) {
    if(start && stop) {
        var startstr    = moment(start).format("D/MM/YYYY");
        var stopstr     = moment(stop).format("D/MM/YYYY");
        var intervalstr = (startstr != stopstr) ? startstr + " - " + stopstr : startstr;
        $("#advDate").text(intervalstr);
        _filters.sdate = moment(start).format("YYYY-MM-DD");
        _filters.edate = moment(stop).format("YYYY-MM-DD");
    }
    else if(!(start && stop)) {
        $("#advDate").text('');
        _filters.sdate = undefined;
        _filters.edate = undefined;
        $('#dtp1').data("DateTimePicker").clear();
        $('#dtp2').data("DateTimePicker").clear();
    }
}

function getShips(cb) {
    $.ajax({
        url: _scheduleShip + "ships",
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
        url:  _scheduleShip + "schedule" + qs,
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
        matches = [];
        substrRegex = new RegExp(q, 'i');
        $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
                matches.push(str);
            }
        });

        cb(matches);
    };
};


function loadCat() {    
    $("#catDrop div").empty();
    $.ajax(contentUrl + "categories/")
	.done(function(data) {
	    var cats = data.categories;
        var ctpl = $("#cp-cats").html();
        for(var i=0; i<cats.length; i++) {
            var col = i%3;            
            $("#catDrop div[data-cp-cbox-pos='" + col + "\']")
                .append($(ctpl).find("input").attr("value", cats[i]._id))
                .append(" " + cats[i].name + '<br>');
        }

        $("#catDrop :checkbox").change(function(e) {
            var cat = this.getAttribute("value");
            var evcats = toDict(cats, '_id');

            if(!_filters.category) _filters.category = [];

            if(this.checked)
                _filters.category.push(cat);
            else {
                var pos = _filters.category.indexOf(cat);
                if(pos > -1) _filters.category.splice(pos, 1);
            }
            if(_filters.category && _filters.category.length > 0) {
                var catStr = '';
                var subCats = _filters.category.slice(0, 2)
                for(var c in subCats) {
                    catStr += (catStr.length > 0 ? ', ' : '') + evcats[subCats[c]].name
                }
                if(catStr.length > 0 && _filters.category.length > subCats.length)
                    catStr += '... +' + (_filters.category.length - subCats.length)
                $("#advCat").html(catStr);
            }
            else $("#advCat").empty();
        });
	})
}


function toDict(objArray, prop) {
    var retObj = {};
    for(var i in objArray) {
        var o = objArray[i];
        if(o.hasOwnProperty(prop)) {
            retObj[o[prop]] = o;
        }
    }
    return retObj;
}

// /promotion/:id
function search() {
    var dateFmt = 'DD/MM/YYYY';
    var q = $("#qt").val(); //text query
    var filterString = '';
    Object.keys(_filters).forEach(function(k,i) {
        if(k == 'position' && _filters[k])
            filterString += '&'+ k + '=' + _filters[k].lon + ',' + _filters[k].lat + ',' + (_filters[k].radius/1000)
        else if(_filters[k]) filterString += "&" + k + "=" + _filters[k];
    });

    $.ajax(baseUrl + 'search?q=' + q + filterString)
    .done(function(data) {
        if(data.metadata.totalCount == 0) {
            $.growl.warning({message: "La ricerca non ha prodotto risultati"});
        }
        else {
            let promo = _filters.type == 'promo';
            $("#sResults").show();
            $("#homeBoxes").hide();
            $("#searchresults").empty();
            var qResults = promo ? data.promos : (_filters.type == 'contents') ? data.contents : data.promos; //TODO default merge results

            $.each(qResults, function(i, item) {            
                $.ajax(baseUrl + 'search/likes?type=promo&idcontent=' + (promo ? item.idcontent + '&idpromo=': '') + item._id)
                .done(function(likesCount) {
                    var hcontext = {
                        id: item._id,
                        title: item.name,
                        town:item.town,
                        image:item.images[0]||undefined,
                        description: item.description,
                        pubDate: moment(new Date(parseInt(item._id.substring(0, 8), 16) * 1000)).format(dateFmt), //mongo specific
                        type: _filters.type,
                        link: baseUrl + 'activities/' + (promo ? item.idcontent + '/promotions/' : '') + item._id,
                        likes: likesCount.total,
                        idcontent: item.idcontent||undefined,
                        startDate: moment(item.startDate).format(dateFmt)||undefined,
                        endDate: moment(item.endDate).format(dateFmt)||undefined
                    };                    
                    $("#searchresults").append(_searchItemTemplate(hcontext));
                });
            });
        }
    });
}