var _searchTemplate = undefined;
var _mapMarker = undefined;
var _defSliderVal = 100;
var _filters = {
    sdate: undefined,
    edate: undefined,
    category: undefined,
    position: undefined, // {lon, lat, pos}
    by_uid: undefined,
    idcontent: undefined,
    limit: 5,
    type: 'promo',    
    q:undefined
};
var _skip = 0;
var _queryResults = [];

$(document).ready(function() {
    initToken();

    addEventListener('promotionLanguageManagerInitialized', function (e) {
        var source   = $("#search-template").html();
        _searchTemplate = Handlebars.compile(source);
        renderBoxes();
        showToolShips();
        showToolDates();
        executeSearch()
        
        loadCat();

        $("#mapview").click(function() {
            $(this).toggleClass("btn-success")
            $("#mapresults").toggle();
            $("#searchresults").toggle();
            if($(this).hasClass("btn-success")) {
                initClusteredMap();
            }
            if(_queryResults.length > 0) {
                showResults();
            }
        })

        $("#doSearch").click(function(e) {
            //reload page including query parameters to enable browser history
            _filters.by_uid = undefined; //if present in history parameters must be reset on new searches
            _filters.idcontent = undefined; //if present in history parameters must be reset on new searches
            _filters.q = $("#qt").val(); //text query
            _filters.type = $("#searchtype").val();
            window.location.href = window.location.href.split("?")[0] + "?" + getQueryString(_filters);
        })

        $("#moreresults").click(function() {
            search(showResults)
        })
        $("#doAdv").click(function(e) {
            if($("#adv").is(":visible")) {
                //resetFilters();
                $("#adv").hide();
            }
            else {
                $("#adv").show();

                $(".rst").click(function(e) {
                    var f=this.getAttribute('data-rst-field');
                    e.preventDefault();
                    resetFilterField(f)
                })

                $(".advTimeMenu").click(function(e) {
                    var t = this.getAttribute('data-cp-tm');
                    switch(t) {
                        case 'd-today':
                            setFilterDates(moment.tz(_tz).toDate(), moment.tz(_tz).endOf('day').toDate());
                            break;
                        case 'd-tom':
                            setFilterDates(moment.tz(_tz).add(1, 'day').startOf('day').toDate(), moment.tz(_tz).add(1,'day').endOf('day').toDate());
                            break;
                        default:
                            break;
                    }
                })
            }
        })
    }, false);
    
    initTranslation();
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

function renderBoxes() {

    var model = {
        uid:undefined,
        contentAdmin:false
    };
    
    jQuery.ajax({
        url: config.contentUIUrl + "/token/decode?decode_token="+ userToken,
        type: "GET",
        success: function(data, textStatus, xhr){
            if(data.valid){
                model.uid = data.token._id;
                model.contentAdmin = contentAdminTypes.indexOf(data.token.type) != -1;
            }
        },
    }).always(function() {
        var boxes = Handlebars.compile($("#boxes-template").html());
        $("#homeBoxes div").append(boxes(model));

        $("#mypromolist").click(function() {
            getMyPromos(this.getAttribute("data-uid"))
        });
    });
}

function getMyPromos(uid) {
    
    jQuery.ajax({
        url: (contentUrl.endsWith("/") ? contentUrl : contentUrl + '/') + "search?type=content&by_uid=" + uid,
        type: "GET",
        success: function(data, textStatus, xhr){
            var cts = data.contents;
            var cntIds = [];
            for(var i=0; i<cts.length; i++) {
                cntIds.push(cts[i]._id);
            }
            window.location.href = baseUrl + "?type=promo&q=&idcontent=" + cntIds.join(',');
        }
    })
}

function executeSearch() {
    var urlParams;
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        re = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = re.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
    
    if(urlParams.q !== undefined) {
        $("#sResults").show();
        $("#homeBoxes").hide();
        $("#searchresults").empty();
        $(".bg-image-cp").css({"min-height":0, "height":"auto", "padding":"15px"})
        $(".bg-image-cp h2").hide();

        var sdate = undefined;
        var edate = undefined;
        var byuid = undefined;
        var idcontent = undefined;
        Object.keys(_filters).forEach(function(k,i) {
            if(urlParams[k] || k=='q') _filters[k] = urlParams[k];
            switch(k) {
                case 'q':
                    $("#qt").val(_filters[k]);
                    break;
                case 'type':
                    $("#searchtype option[value=" + _filters[k] + "]").attr('selected','selected');
                    break;
                case 'sdate':
                    sdate = _filters[k];
                    break;
                case 'edate':
                    edate = _filters[k];
                    break;
                case 'by_uid':
                    byuid = _filters[k];
                    break;
                case 'idcontent':
                    idcontent = _filters[k];
                    break;
                case 'category':
                    if(_filters[k]) {
                        _filters[k] = _filters[k].split(',');
                        for(var i=0; i<_filters[k].length; i++) _filters[k][i] = Number(_filters[k][i]);
                    }
                    break;
                case 'position':
                    if(_filters[k]) {
                        var pos = _filters[k].split(',');
                        _filters[k] = {
                            lon: Number(pos[0]),
                            lat: Number(pos[1]),
                            radius: Number(pos[2]) * 1000
                        }
                        gooGeocode(_filters[k].lat, _filters[k].lon, function(address) {                            
                            setPositionSearchLabel(_filters[k].radius, address)
                        });
                    }
                    break;
                default:
                    break;
            }
        });
        if(sdate && edate) setFilterDates(moment.utc(sdate).tz(_tz).toDate(), moment.utc(edate).tz(_tz).toDate());

        _skip = 0;
        _queryResults = []; //reset search history
        search(showResults);
    }
}

function setPositionSearchLabel(dist, address) {
    if(dist) $("#advPosDist").text(dist + "m from ");
    if(address) $("#advPos").text(address);
}

function initTranslation() {
    $.ajax({
        cache: false,
        url: baseUrl + 'customAssets/translations/translation.json',
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
}

function showResults(qresults) {
    if(qresults) _queryResults = _queryResults.concat(qresults);
    for(var i=0; i < _queryResults.length; i++) {
        initTitleJsonMultilanguage(_queryResults[i].title, _queryResults[i].id);
        _queryResults[i].titleLangId = _queryResults[i].id + '.title';
        initDescriptionJsonMultilanguage(_queryResults[i].description, _queryResults[i].id, 300);
        _queryResults[i].descLangId = _queryResults[i].id + '.description';
    }

    if($("#mapview").hasClass("btn-success")) {
        var locations = [];
        var infowindows = [];
        var qr = _queryResults; //just an alias
        for(var i=0; i < qr.length; i++) {     

            if(qr[i].lat && qr[i].lon) {
                locations.push({lat: qr[i].lat, lng: qr[i].lon});
                infowindows.push(
                    "<div><h3><a href='" 
                    + qr[i].link + "'>" + i18next.t(qr[i].titleLangId) + "</a></h3>"
                    + (qr[i].town ? "<i class='fa fa-map'></i> " + qr[i].town + '<br>': '')
                    + (qr[i].address ? "<i class='fa fa-map-marker'></i> " + qr[i].address + '<br>': '')
                    + (qr[i].likes ? "<i class='fa fa fa-thumbs-up'></i> " + qr[i].likes + '<br>': '')
                    + "<i class='fa fa-calendar'></i> " + (qr[i].startDate ? qr[i].startDate : qr[i].pubDate)
                    + "</div>")
            }
        }
        setMapClusters(locations, infowindows);
        $('body').localize();
    }
    else {
        $("#searchresults").html(_searchTemplate({items:_queryResults}));
    }
    $('body').localize();
}


function resetFilterField(field) {
    switch(field) {
        case 'position':
            _filters.position = undefined;
            $("#advPos").empty();
            $("#advPosDist").empty();
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
                setPositionSearchLabel(_filters.position.radius, address)                
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

    var radiusVal = (_filters.position ? _filters.position.radius : undefined)||100;
    $('#slider1-value-rounded').text(radiusVal);
    $('#slider1-rounded').slider({
        value: radiusVal,
        min: _defSliderVal,
        max: 20000,
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
            setPositionSearchLabel(ui.value)
        }
    });
}

function initClusteredMap() {
    clusteredmap = new google.maps.Map(document.getElementById('mapresults'), {
      zoom: 12,
      center: {lat: 39.207737, lng: 9.157010}
    });
}
 

function setMapClusters(locations, infowindows){    
    // Create an array of alphabetical characters used to label the markers.
    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var markers = locations.map(function(location, i) {
        var marker = new google.maps.Marker({
            position: location,
            animation: google.maps.Animation.DROP,
            label: labels[i % labels.length]
        });

        var infowindow = new google.maps.InfoWindow({
            content: infowindows[i]
        });

        marker.addListener('click', function() {
            infowindow.open(clusteredmap, marker);
        });

        return marker;
    });

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(clusteredmap, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    });

    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
        var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
        var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
        bounds.extend(extendPoint1);
        bounds.extend(extendPoint2);
     }

    clusteredmap.fitBounds(bounds);
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
        ignoreReadonly: true,
        widgetPositioning: {horizontal:"left", vertical:"bottom"}
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
            getLastSchedule(namecomp[1].trim(), namecomp[0].trim(), function(ships){
                if(ships.ships.length == 1) {
                    var last = ships.ships[0];
                    //Time in shipms is stored in UTC
                    var start = moment.tz(last.arrival, _tz).toDate();
                    var stop = moment.tz(last.departure, _tz).toDate();
                }
                else $.growl.warning({ message: "Nessun arrivo previsto per la nave selezionata" })
                setFilterDates(start, stop);
            });
        });
    });
}


function setFilterDates(start, stop) {
    if(start && stop) {
        var startstr    = moment(start).format("D/MM/YYYY HH:mm");
        var stopstr     = moment(stop).format("D/MM/YYYY HH:mm");
        var intervalstr = (startstr != stopstr) ? startstr + " - " + stopstr : startstr;
        $("#advDate").text(intervalstr);
        _filters.sdate = moment(start).utc().format("YYYY-MM-DD HH:mm");
        _filters.edate = moment(stop).utc().format("YYYY-MM-DD HH:mm");
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
    qs += "&sdate=" + encodeURIComponent(moment().startOf('day'));
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
    $("#catDrop").empty();
    $.ajax(contentUrl + "categories/")
	.done(function(data) {
        var cats = data.categories;

        for(var i=0; i<cats.length; i++) {
            initGenericContentJsonMultilanguage(cats[i].name, "cat_"+cats[i]._id, "cat_name")
            if(_filters.category && _filters.category.length > 0 && _filters.category.indexOf(cats[i]._id) > -1) {
                cats[i].checked = true;
            }
        }

        var ctpl = Handlebars.compile($("#cats-tpl").html());
        $("#catDrop").append(ctpl({cats:cats}));

        showCatString(cats);

        $("#catDrop :checkbox").change(function(e) {
            var cat = Number(this.getAttribute("value"));
            if(!_filters.category) _filters.category = [];

            if(this.checked)
                _filters.category.push(cat);
            else {
                var pos = _filters.category.indexOf(cat);
                if(pos > -1) _filters.category.splice(pos, 1);
            }
            showCatString(cats);
        });
	})
}


function showCatString(cats) {
    //var evcats = toDict(cats, '_id');
    if(_filters.category && _filters.category.length > 0) {
        var catStr = '';
        var subCats = _filters.category.slice(0, 2)
        for(var c in subCats) {
            //catStr += (catStr.length > 0 ? ', ' : '') + evcats[subCats[c]].name
            catStr += (catStr.length > 0 ? ', ' : '') + i18next.t("cat_"+subCats[c]+".cat_name")
        }
        if(catStr.length > 0 && _filters.category.length > subCats.length)
            catStr += '... +' + (_filters.category.length - subCats.length)
        $("#advCat").html(catStr);
    }
    else $("#advCat").empty();
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


//call onclick to construct the url
function getQueryString(obj) {    
    var filterString = '';
    Object.keys(obj).forEach(function(k,i) {
        if(k == 'position' && obj[k])
            filterString += (filterString.length > 0 ? '&' : '') + k + '=' + obj[k].lon + ',' + obj[k].lat + ',' + (obj[k].radius/1000)
        else if(k=="q") 
            filterString += (filterString.length > 0 ? '&' : '') + k + "=" + obj[k];
        else if(_filters[k]) 
            filterString += (filterString.length > 0 ? '&' : '') + k + "=" + obj[k];
    });
    return filterString;
}




function search(cb) {
    var dateFmt = 'DD/MM/YYYY';

    $.ajax(baseUrl + 'search?' + getQueryString(_filters) + "&skip=" + _skip)
    .done(function(data) {
        if(data.metadata.totalCount == 0) {
            $.growl.warning({message: "La ricerca non ha prodotto risultati"});
            $("#moreresults").hide();
        }
        else {
            if(data.metadata.totalCount > data.metadata.limit + data.metadata.skip)
                $("#moreresults").show();
            else
                $("#moreresults").hide();
            let promo = _filters.type == 'promo';
            _skip += Number(_filters.limit); //skip for next call

            var qResults = promo ? data.promos : (_filters.type == 'content') ? data.contents : data.promos; //TODO default merge results
            var qres = [];
            $.each(qResults, function(i, item) {
                var hcontext = {
                    id: item._id,
                    title: item.name,
                    town:item.town,
                    image:item.images ? common.normalizeImgUrl(item.images[0]) : undefined,
                    description: item.description, //common.markup(common.resizeString(item.description, 350)),
                    pubDate: moment.tz(new Date(parseInt(item._id.substring(0, 8), 16) * 1000), _tz).format(dateFmt), //mongo specific
                    type: _filters.type,
                    link: baseUrl + 'activities/' + (promo ? item.idcontent + '/promotions/' : '') + item._id,
                    likes: item.likes
                };
                if(promo) {
                    hcontext.idcontent = item.idcontent||undefined,
                    hcontext.startDate = moment(item.startDate).format(dateFmt)||undefined, //converte da UTC a locale
                    hcontext.endDate = moment(item.endDate).format(dateFmt)||undefined,
                    hcontext.recurrency = item.recurrency_group && item.recurrency_group != null
                }
                if(item.position) {
                    hcontext.lat = item.position[1];
                    hcontext.lon = item.position[0];
                }
                else if(item.lat && item.lon) {
                    hcontext.lat = item.lat;
                    hcontext.lon = item.lon;
                }
                qres.push(hcontext);
            });
            if(cb) cb(qres);
        }
    });
}