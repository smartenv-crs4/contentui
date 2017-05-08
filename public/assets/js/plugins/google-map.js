

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



var GoogleMap = function () {

  return {
    initGoogleMap: function (lat, lng, zoom) {
      let latitude = lat;
      let longitude = lng;

      let map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:lat, lng:lng},
        scrollwheel: false,
        zoom: zoom
      });
      let marker = new google.maps.Marker({
        position: {lat:lat, lng:lng},
        map: map
      });

      google.maps.event.addListener(map, "click", function (event) {
        latitude = event.latLng.lat();
        longitude = event.latLng.lng();
        marker.setPosition(new google.maps.LatLng(latitude,longitude));

        document.getElementById("latbox").innerHTML = latitude;
        document.getElementById("lngbox").innerHTML = longitude;
        geocodeLatLng(latitude, longitude);
      });

      document.getElementById("latbox").innerHTML = latitude;
      document.getElementById("lngbox").innerHTML = longitude;
      geocodeLatLng(latitude, longitude);

    },


  };
  // End Return

}();

