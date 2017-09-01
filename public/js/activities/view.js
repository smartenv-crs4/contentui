/**
 * Created by albe on 27/03/2017.
 */

let TOKEN = "?fakeuid=abcbabcabcbabcbabcba1234";
let latitude = 39.21054;
let longitude = 9.1191;
let zoom = 12;


$(document).ready(function() {
  $("#name").text(activityBody.name);
  $("#description").text(activityBody.description);
  //$("#editUrl").attr("href", "edit?action=edit");

  $('#datetimepicker12').datetimepicker({
    inline: true,
    format: 'DD/MM/YYYY',
    allowInputToggle: true,
    useCurrent : true
  });

  $('#addPromotionButton').click(function(e) {
    addPromotion();
  });


  var imgThumb = $("#img-thumb").html();
  var imageContainer = document.getElementById("imageContainer");

  for(let i=0; i<activityBody.images.length; i++) {
    let col = i % 4;
    let img = $(imgThumb).find("img").attr("src", activityBody.images[i]);
    $("#imageContainer div[data-img-thumb-pos='" + col + "\']").append(img).append('<br>'); //.find("img").attr("src", activityBody.images[0]));
  }


  var catBox = $("#cp-cats").html();

  for(let i=0; i<activityBody.category.length; i++) {
     $.ajax(contentUrl + "categories/"+activityBody.category[i]+TOKEN)
       .done(function(cat) {
        var col = i%4;
        $("#catDrop div[data-cp-cbox-pos='" + col + "\']").append($(catBox).append(cat.name));
       })
  }


  App.init();
  initMap(activityBody.name, activityBody.description, activityBody.lat, activityBody.lon);

  common.getPromotions();

});



function initMap(title, description, latitude, longitude) {

  var map = new GMaps({
    div: '#map',
    scrollwheel: false,
    lat: latitude,
    lng: longitude,
    zoom: zoom,
    title: title,
    infoWindow: {
      content: '<p>HTML Content</p>'
    }


  });

  var marker = map.addMarker({
    lat: latitude,
    lng: longitude
  });

  map.drawOverlay({
    lat: latitude,
    lng: longitude,
    content: '<div class="overlay"><h3>'+title+'</h3></div>'
  });

  geocodeLatLng(latitude, longitude);
}

function geocodeLatLng(lat, lng) {
  let geocoder = new google.maps.Geocoder;
  let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
  let address = null;


  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {
        address = results[1].formatted_address;

      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
    $("#address").html("Indirizzo: "+address);
  });
}


function addPromotion(){
  window.location = baseUrl + "activities/" + activityBody._id + '/promotions/new'+TOKEN;
}
