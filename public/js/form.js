/**
 * Created by albe on 27/03/2017.
 */

let TOKEN = "?fakeuid=abcbabcabcbabcbabcba1234";
let latitude = 39.21054;
let longitude = 9.1191;
let zoom = 12;

images_array_fd = [];
img_array_url = [];

$(document).ready(function() {

  $("#addContent").click(function(e) {
    addContent();
  });

  $("#doSearch").click(function(e) {
    search();
  });

  $("#fileUpload").change(function() {
    loadImagePreview(this);
  });

  App.init();
  loadCat();
  initMap();
});

(function(global) {
  global.images_array_URL = [];
}(this));

function loadImagePreview(input) {

  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.onload = function(e) {
      if ($('#previewHolder').length) {$('#imageContainer').empty();}  // remove temp images

      let _id = "img-"+input.files[0].name;
      let objectURL = URL.createObjectURL(input.files[0]);
      $('#imageContainer').append('<div class="col-sm-3 col-xs-6 md-margin-bottom-20"> <img id='+_id+' class="img-responsive rounded-2x" src='+objectURL+' data='+input.files[0]+'alt=""> </div>');

      let file = input.files[0];
      let formData = new FormData();
      formData.append(file.name.split(".")[0], file);

      images_array_fd.push(formData);

    };

    reader.readAsDataURL(input.files[0]);


  }
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



//---------- POST to actions/uploadprofileimage that goes to uploadms
function getUploadmsImageURL(image, cb) {
  jQuery.ajax({
    url: baseUrl + "actions/uploadimage",
    data: image,
    processData: false,
    contentType: false,
    type: 'POST',
    success: function(data){
      console.log("success");
      //console.log("data "+JSON.stringify(data));

      cb(uploadmsUrl+"file/"+data.filecode);
      //img_array_url.push(uploadmsUrl+"file/"+data.filecode);

      //return uploadmsUrl+"file/"+data.filecode;

      //console.log("added url: "+uploadmsUrl+"file/"+data.filecode);
    },
    error: function(xhr, status)
    {
      let errType="error." + xhr.status;
      let msg=i18next.t(errType);

      try{
        msg = msg + " --> " + xhr.responseJSON.error_message;
      }
      catch(err){ }
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    }
  });

}


function addContent() {

  var name = $('#name').val();
  var description = $('#description').val();
  var published = true;
  var town = $('#address').innerHTML;
  var [lat, lng] = [$('#latbox').text(), $('#lngbox').text()];
  var category_array = $('input[name="category"]:checked').map(function () {
    return this.value;
  }).get();
  var img_array_url = [];

  console.log("name: ", name);
  console.log("description: ", description);
  console.log("published: ", published);
  console.log("town: ", town);
  console.log("lat, lon: ", [lat, lng]);
  console.log("category_array", category_array);

  var contentData = {
    name: name,
    type: "eventa_promotions",
    description: description,
    published: true,
    town: town,
    category: category_array.slice(),
    images: [],
    lat: lat,
    lon: lng
  };



  images_array_fd.forEach(function(fd_img) {
    getUploadmsImageURL(fd_img, function(img_url) {
      contentData.images.push(img_url);
      console.log("url is: ", img_url);

      if(contentData.images.length  === images_array_fd.length) {
        console.log("contentData: ", JSON.stringify(contentData));

        $.ajax({
          url: contentsUrl + "contents/" + TOKEN,
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(contentData),            //stringify is important
          success: function (response) {
            console.log("RESPONSE DA post su contents: " + JSON.stringify(response));
            bootbox.dialog({title: 'Success', message: "Content Added " + JSON.stringify(response)});
          },
          error: function (response) {
            console.log("ERROR DA post su contents ");
            bootbox.dialog({title: 'Warning', message: "Error adding content "});
          }
        });
      }

    });
  });



  //
  // Promise.all(requests).then(() => console.log('done'));
  //
  //
  // async.each(images_array_fd, function (fd_img, callback) {
  //   uploadImagesToUploadms(fd_img, function (img_url) {
  //     img_array_url.push(img_url);
  //     console.log("images_array_URL from uploadImagesToUploadms", img_array_url);
  //
  //     //test = img_url;
  //   });
  //   callback(null, img_array_url);
  // }, function (err, img_array_url) {
  //   if (err) {
  //     console.log('An image failed to process');
  //   } else {
  //     console.log('All images have been processed successfully');
  //     console.log("images_array_URL ", img_array_url);
  //     $('#image_array_url').text(JSON.stringify(img_array_url));
  //
  //
  //     let data = {
  //       name: name,
  //       type: "eventa_promotions",
  //       description: description,
  //       published: true,
  //       town: town,
  //       category: category_array.slice(),
  //       images: img_array_url,
  //       lat: lat,
  //       lon: lng
  //     };
  //
  //     console.log("data is " + JSON.stringify(data));
  //
  //     $.ajax({
  //       url: contentsUrl + "contents/" + TOKEN,
  //       type: 'POST',
  //       contentType: 'application/json',
  //       data: JSON.stringify(data),            //stringify is important
  //       success: function (response) {
  //         console.log("RESPONSE DA post su contents: " + JSON.stringify(response));
  //         //bootbox.dialog({title: 'Success', message: "Content Added " + JSON.stringify(response)});
  //       },
  //       error: function (response) {
  //         console.log("ERROR DA post su contents ");
  //         //bootbox.dialog({title: 'Warning', message: "Error adding content "});
  //       }
  //     });
  //   }
  //
  // });
}
