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

  $("#fileUpload").change(function() {
    uploadImagePreview(this);
  });

  App.init();
  loadCat();
  initMap();

});


function uploadImagePreview(input) {



  if (input.files && input.files[0]) {

    console.log(URL.createObjectURL(input.files[0]));

    var reader = new FileReader();
    reader.onload = function(e) {

      if ($('#previewHolder').length) {
        $('#imageContainer').empty();
      }

      var _id = "img-"+input.files[0].name;
      var objectURL = URL.createObjectURL(input.files[0]);
      $('#imageContainer').append('<div class="col-sm-3 col-xs-6 md-margin-bottom-20"> <img id='+_id+' class="img-responsive rounded-2x" src='+objectURL+' data='+input.files[0]+'alt=""> </div>');


      var file = input.files[0];
      var fd = new FormData();
      fd.append( file.name.split(".")[0], file);

      console.log(JSON.stringify(fd));


      jQuery.ajax({
        url: baseUrl + "actions/uploadprofileimage",
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
          console.log("success");
        },
        error: function(xhr, status)
        {

          var errType="error." + xhr.status;
          var msg=i18next.t(errType);

          try{
            msg = msg + " --> " + xhr.responseJSON.error_message;
          }
          catch(err){ }
          jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
        }
      });

    };

    reader.readAsDataURL(input.files[0]);


  }
}


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




function uploadImagesToUploadms(images, _cb) {

  var images = $("#imageContainer").find("img").map(function() {
    return this.src;
  }).get();

  var reader = new FileReader();
  var fr1 = reader.readAsBinaryString(new Blob(images[0], {type: ''}));


  console.log("images are: "+images);
  console.log("fr2 is: "+fr1);


  // var fd = new FormData();
    // fd.append( file.name, file);
//
//     jQuery.ajax({
//       url: _userMsUrl + "/users/actions/uploadprofileimage",
//       data: fd,
//       processData: false,
//       contentType: false,
//       type: 'POST',
//       success: function(data){
//         jQuery('#ed-avatarButton').click();
// //            console.log(jQuery('#ed-avatar').html());
//         jQuery('#ed-avatar').html(data.filecode).blur();
//         jQuery('#profileSave').click();
//       },
//       error: function(xhr, status)
//       {
//
//         var errType="error." + xhr.status;
//         var msg=i18next.t(errType);
//
//         try{
//           msg = msg + " --> " + xhr.responseJSON.error_message;
//         }
//         catch(err){ }
//         jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
//       }
//     });
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


  var images = $("#imageContainer").find("img").map(function() {
    return this.src;
  }).get();


  uploadImagesToUploadms(images, function(error, res){

  });


  console.log("images", images);

  let data = {
    name: name,
    type: "eventa_promotions",
    description: description,
    published: true,
    town: town,
    category: category_array,
    lat: lat,
    lon: lng
  };

  $.ajax({
    url: contentsUrl + "contents/"+TOKEN,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),            //stringify is important
    success: function (response) {
                console.log("RESPONSE DA post su contents: " + JSON.stringify(response));
                bootbox.dialog({ title: 'Success', message:"Content Added " + JSON.stringify(response)});
              },
    error: function (response) {
              console.log("ERROR DA post su contents ");
              bootbox.dialog({ title: 'Warning', message:"Error adding content " });
            }
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

        $("#catDrop div[data-cp-cbox-pos='" + col + "\']").append($(ctpl).find("input").attr("value", cats[i]._id)).append(" " + cats[i].name).append('<br>');
      }
    })
}


