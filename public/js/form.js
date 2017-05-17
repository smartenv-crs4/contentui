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


  $("#fileUpload").change(function() {
    loadImagePreview(this);

  });

  $('#datetimepicker12').datetimepicker({
    inline: true,
    format: 'DD/MM/YYYY',
    allowInputToggle: true,
    useCurrent : true
  });



  App.init();
  loadCat();
  initMap();
});

(function(global) {
  global.images_array_URL = [];
}(this));


function removePicture(elem){
  var id = $(elem).closest('.img-wrap').find('img').data('id');

  bootbox.confirm("Vuoi rimuovere l'immagine "+id, function(result){
    if (result) {
      $(elem).parent().parent().remove();
      for (var i = 0; i < images_array_fd.length; i++)
        if (images_array_fd[i].id === id) {
          images_array_fd.splice(i, 1);
        }
    }

    console.log(JSON.stringify(images_array_fd));

  });

}

function loadImagePreview(input) {

  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.onload = function(e) {
      if ($('#previewHolder').length) {$('#imageContainer').empty();}  // remove temp images

      let _id = "img-"+input.files[0].name.replace(/\s/g,'');
      let objectURL = URL.createObjectURL(input.files[0]);
      $('#imageContainer').append('<div class="col-sm-3 col-xs-6 md-margin-bottom-20"> <div class="img-wrap"> <span class="deletebutton" onclick="removePicture(this)">&times;</span> <img data-id='+_id+' class="img-responsive rounded-2x" src='+objectURL+' data='+input.files[0]+'alt=""> </div> </div>');

      let file = input.files[0];
      let formData = new FormData();
      formData.append(file.name.split(".")[0], file);

      images_array_fd.push({id:_id, formData: formData});

      console.log(JSON.stringify(images_array_fd));

    };

    reader.readAsDataURL(input.files[0]);
    //input.files[0].value = '';


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
      cb(uploadmsUrl+"file/"+data.filecode);
      console.log("added url: "+uploadmsUrl+"file/"+data.filecode);
    },
    error: function(xhr, status)
    {
      let errType="error." + xhr.status;
      let msg = i18next.t(errType);

      try{
        msg = msg + "Error uploading image! Check filesize. ";
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



  if (images_array_fd.length > 0 ) {
    images_array_fd.forEach(function (fd_img) {
      getUploadmsImageURL(fd_img.formData, function (img_url) {
        contentData.images.push(img_url);
        console.log("url is: ", img_url);
        if (contentData.images.length === images_array_fd.length) {
          console.log("contentData: ", JSON.stringify(contentData));
          storeContentToContentms(contentData);
        }
      });
    });
  } else {
    console.log("\n\n\n no images to upload");
    storeContentToContentms(contentData);
  }

}

function storeContentToContentms(contentData) {

  console.log("\n\n\n storeContentToContentms");

  $.ajax({
    url: contentsUrl + "contents" + TOKEN,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(contentData),            //stringify is important
    success: function (response) {
      console.log("RESPONSE DA post su contents: " + JSON.stringify(response));
      //go to the content page:
      bootbox.dialog({title: 'Success', message: "Content Added " + JSON.stringify(response)});
      //window.location = baseUrl + "activities/" + response._id +TOKEN;
    },
    error: function (response) {
      console.log("ERROR DA post su contents ");
      bootbox.dialog({title: 'Warning', message: "Error adding content "});
    }
  });
}
