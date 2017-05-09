/**
 * Created by albe on 27/03/2017.
 */

let TOKEN = "?fakeuid=abcbabcabcbabcbabcba1234";
let latitude = 39.21054;
let longitude = 9.1191;
let zoom = 12;


$(document).ready(function() {

  $("#addContent").click(function(e) {
    addContent();
  });

  $("#doSearch").click(function(e) {
    search();
  });

  App.init();
  loadCat();
  initMap();

});


function geocodeLatLng(lat, lng) {
  let geocoder = new google.maps.Geocoder;
  let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
  let address = null;
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {
        console.log(results[1].formatted_address);
        address = results[1].formatted_address;
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
    document.getElementById("address").innerHTML = address;
  });
}



function initMap() {

    var map = new GMaps({
      div: '#map',
      scrollwheel: false,
      lat: latitude,
      lng: longitude,
      zoom: zoom,
      click: function (event) {
        latitude = event.latLng.lat();
        longitude = event.latLng.lng();
        marker.setPosition(new google.maps.LatLng(latitude,longitude));
        document.getElementById("latbox").innerHTML = latitude;
        document.getElementById("lngbox").innerHTML = longitude;
        geocodeLatLng(latitude, longitude);
      }
    });

  var marker = map.addMarker({
    lat: latitude,
    lng: longitude
  });

    document.getElementById("latbox").innerHTML = latitude;
    document.getElementById("lngbox").innerHTML = longitude;
    geocodeLatLng(latitude, longitude);
}



function addContent() {

  let name = $('#name').val();
  let description = $('#description').val();
  let published = true;
  let town = $('#address').innerHTML;
  let [lat, lng] = [$('#latbox').text(), $('#lngbox').text()];

  console.log("name: ", name);
  console.log("description: ", description);
  console.log("published: ", published);
  console.log("town: ", town);
  console.log("lat, lon: ", [lat, lng]);

  let category_array = $('input[name="category"]:checked').map(function() {
    return this.value;
  }).get();

  console.log("category_array", category_array);

  category_array = ["12","23"];

  let data = {
    name: name,
    type: "eventa_promotions",
    description: description,
    published: true,
    town: town,
    category: ["12","23"],
    lat: lat,
    lon: lng
  };

  console.log(data);

  $.post(contentsUrl + "contents/"+TOKEN, data )
    .done(function(msg){
      console.log("RESPONSE DA post su contents: " + JSON.stringify(msg));
      bootbox.dialog({ title: 'Success', message:"Content Added " + JSON.stringify(msg)});
    })
    .fail(function(xhr, status, error) {
      console.log("ERROR DA post su contents: " +error);
      bootbox.dialog({ title: 'Warning', message:"Error adding content " +error });
    });


}

function loadCat() {

  $('#myModal-categories').modal('show');


  $("#catDrop div").empty();
  $.ajax(contentsUrl + "categories/")
    .done(function(data) {
      var cats = data.categories;
      var ctpl = $("#cp-cats").html();

      console.log(cats.length);

      for(var i=0; i<cats.length; i++) {
        var col = i%4;

        $("#catDrop div[data-cp-cbox-pos='" + col + "\']").append('<br><input name="category" type="checkbox" value="' + cats[i]._id + '" >').append(" " + cats[i].name + "   ");


        //$("#catDrop div[data-cp-cbox-pos='" + col + "\']").append($(ctpl).find("input").attr("value", cats[i]._id)).append(" " + cats[i].name + "   ");
      }
    })
}