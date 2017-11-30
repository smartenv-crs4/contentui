/**
 * Created by albe on 27/03/2017.
 * Mantained by Dino from 04/17
 */

var zoom = 12;
var images_array_fd = [];

var _form_ds = {
  admins     : [],
  htplAdmin  : undefined,
  lat: 39.21054,
  lon: 9.1191
}
var _growl = $.growl; //wa removeAdmin jquery+growl scope.... (?)

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
    });
}


function loadImagePreview(input) {

  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.onload = function(e) {

      let _id = "img-"+input.files[0].name.replace(/\s/g,'');
      let objectURL = URL.createObjectURL(input.files[0]);
      $('#imageContainer').append('<div class="col-sm-3 col-xs-6 md-margin-bottom-20"> <div class="img-wrap"> <span class="deletebutton" onclick="removePicture(this)">&times;</span> <img name="image" data-id='+_id+' class="img-responsive rounded-2x" src='+objectURL+' data='+input.files[0]+'alt=""> </div> </div>');

      let file = input.files[0];
      let formData = new FormData();
      formData.append(file.name.split(".")[0], file, file.name);

      images_array_fd.push({id:_id, formData: formData});

      //console.log(JSON.stringify(images_array_fd));

    };

    reader.readAsDataURL(input.files[0]);
    //input.files[0].value = '';


  }
}

function getUploadmsImageURL(image, cb) {
    jQuery.ajax({
        url: uploadUrl + "file",
        headers: {
          Authorization: "Bearer " + userToken
        },
        data: image,
        enctype: 'multipart/form-data',
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){            
            cb(uploadUrl+"file/"+data.filecode);
        },
        error: function(xhr, status)
        {
            let errType="error." + xhr.status;
            let msg = i18next.t(errType);            
            try{
                msg = msg + "Error uploading image! Check filesize. ";
            }
            catch(err){ console.log(err)}
            jQuery.growl.error({message:msg});
        }
    });
}

function initMapEdit(lat, lon) {
    var latitude = lat || _form_ds.lat;
    var longitude = lon || _form_ds.lon;

    var map = new GMaps({
        div: '#f_map',
        scrollwheel: false,
        lat: latitude,
        lng: longitude,
        zoom: zoom,
        click: function (event) {
            latitude = event.latLng.lat();
            longitude = event.latLng.lng();
            marker.setPosition(new google.maps.LatLng(latitude,longitude));
            _form_ds.lat = latitude;
            _form_ds.lon = longitude;
            geocodeLatLng(latitude, longitude, 'f_address');
        }
    });

    var marker = map.addMarker({
        lat: latitude,
        lng: longitude
    });
    geocodeLatLng(latitude, longitude, 'f_address');
}


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

    geocodeLatLng(latitude, longitude, "address");
}


function geocodeLatLng(lat, lng, adrlabel) {
    let geocoder = new google.maps.Geocoder;
    let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    let address = null;
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
            if (results[1]) {
                address = results[1].formatted_address;
            } 
            else {
                window.alert('No results found');
            }
        } 
        else {
            window.alert('Geocoder failed due to: ' + status);
        }

        document.getElementById(adrlabel).innerHTML = address;
    });
}


function loadCat(action) {
  $('#myModal-categories').modal('show');
  $("#f_catDrop div").empty();
  $.ajax(contentUrl + "categories/")
    .done(function(data) {
      var cats = data.categories;
      var ctpl = $("#f_cp-cats").html();

      for(var i=0; i<cats.length; i++) {
        var col = i%4;
        $("#f_catDrop div[data-cp-cbox-pos='" + col + "\']").append($(ctpl).find("input").attr("value", cats[i]._id)).append(" " + cats[i].name).append('<br>');
      }
      if(activityBody) {
        if (i === cats.length && action == true)
          $.each(activityBody.category, function(i, val){
              $("input[value='" + val + "']").prop('checked', true);
          });
        }
    });

}



function loadContent() {
    if(activityBody) {
        $("#f_name").val(activityBody.name);
        $("#f_description").val(activityBody.description);
    }

    var imgThumb = $("#img-thumb").html();
    var imageContainer = document.getElementById("f_imageContainer");

    if(activityBody) {
        for(let i=0; i<activityBody.images.length; i++) {
            let col = i % 4;
            let img = $(imgThumb).find("img").attr("src", activityBody.images[i]);

            $('#f_imageContainer').append('<div class="col-sm-3 col-xs-6 md-margin-bottom-20"> ' +
            '<div class="img-wrap"> <span class="deletebutton" onclick="removePicture(this)">&times;</span> ' +
            '<img name="image" data-id='+activityBody.images[i].split('/').pop()+' class="img-responsive rounded-2x" src='+activityBody.images[i]+' > </div> ' +
            '</div>');

            // $("#imageContainer div[data-img-thumb-pos='" + col + "\']").append(img).append('<br>'); //.find("img").attr("src", activityBody.images[0]));
        }
    }

}



function addContent() {

  var name = $('#f_name').val();
  var description = $('#f_description').val();
  var published = true;
  var town = $('#f_address').innerHTML;
  var category_array = $('input[name="category"]:checked').map(function () {
    return this.value;
  }).get();
  var img_array_url = [];
  var contentData = {
    name: name,
    type: "activity",
    description: description,
    published: true,
    town: town,
    category: category_array.slice(),
    images: [],
    lat: _form_ds.lat,
    lon: _form_ds.lon
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
  $.ajax({
    url: contentUrl + "contents",
    headers: {
      Authorization: "Bearer " + userToken
    },
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(contentData),
    success: function (response) {      
      _growl.notice({message: "Content Added"});
      window.location = baseUrl + "activities/" + response._id;
    },
    error: function (response) {      
      _growl.error({message: "Error adding content "});
    }
  });
}

function updateContentToContentms(contentData){
  $.ajax({
    url: contentUrl + "contents/" + activityBody._id,
    headers: {
      Authorization: "Bearer " + userToken
    },
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify(contentData),
    success: function (response) {
        activityBody = response; //!!!!!!!
        $(".editmode").hide();
        $(".viewmode").show();
        $(".loggedonly").show();        
        _growl.notice({message:"Update success"})
        initView();
    },
    error: function (response) {      
      _growl.error({message: "Error updating content "});
    }
  });


}


function updateContent(){
  var name = $('#f_name').val();
  var description = $('#f_description').val();
  var published = true;
  var town = $('#f_address').innerHTML;  
  var category_array = $('input[name="category"]:checked').map(function () {
    return this.value;
  }).get();

  var contentData = {
    name: name,
    type: "activity",
    description: description,
    published: true,
    town: town,
    category: category_array.slice(),
    images:[],
    lat: _form_ds.lat,
    lon: _form_ds.lon
  };

  contentData.images = $('img[name="image"]').map(function () {
    if (!this.src.match("^blob"))
      return this.src;
  }).get();

  var oldImagesLength = contentData.images.length;

//////////////////////////////////////////
//TODO RIFARE IMMAGINI!!!!!!!!!!!!
//////////////////////////////////////////
  if(false) { //(images_array_fd.length > 0 ) {
    images_array_fd.forEach(function (fd_img) {
      getUploadmsImageURL(fd_img.formData, function (img_url) {
        contentData.images.push(img_url);
        if ((contentData.images.length - images_array_fd.length) === oldImagesLength) {  // bisogna considearere le immagini già presenti per capire se le ha caricate tutte
          //console.log("contentData: ", JSON.stringify(contentData));
          updateContentToContentms(contentData);
        }
      });
    });
  } else {
    updateContentToContentms(contentData);
  }
}
  
  
function addPromotion(){
    window.location = baseUrl + "activities/" + activityBody._id + '/promotions/new';
}




//////////////////////////////////////////
//////////////////////////////////////////
////// DS
//////////////////////////////////////////
//////////////////////////////////////////

function spliceOwner(admins) {
    var ret = [];
    for(var i=0; i<admins.length; i++) {
        if(admins[i]._id != activityBody.owner) {
            ret.push(admins[i]);
        }
    }
    return ret;
}

function renderAdmins(admins) {
  $("#adminlist").html(_form_ds.htplAdmin({admins:spliceOwner(admins)}));
  $(".delAdmin").click(function(e) {        
      e.preventDefault();
      var uid = this.getAttribute("data-admin-id");
      editAdmins(uid, 'remove', function(newadmins) {
          _form_ds.admins = newadmins;
          getAdmins(newadmins, renderAdmins);
      });
  })
}



function getAdmins(admList, cb) {    
  if(admList.length > 0) {        
      var adms = admList.join('&adm=');        
      $.ajax({
          url: baseUrl + "activities/admins" + "?adm=" + adms,
          headers: {
              Authorization: "Bearer " + userToken
          },
          cache: false,
          method: 'GET',
          success: function(data){              
              if(cb) cb(data);
          },
          error: function(e) {
              console.log(e);
              _growl.warning({message: "Something went wrong when getting admins list"});
          }
      });
  }
}

//TODO popup conferma rimozione
function removeAdmin(uid, cb) {
  if(uid) {        
      var aid = activityBody._id;
      $.ajax({
          url: contentUrl + "contents/" + aid + "/actions/removeAdmin",
          method: 'POST',
          headers: {
              Authorization: "Bearer " + userToken
          },
          data: {userId:uid},
          success: function(d){
              //console.log(d);
              _growl.notice({message:"Admin successfully removed"});
              if(cb) cb(d.admins);
          },
          error: function(e) {
              console.log(e);
              _growl.error({message: "Error removing admin"});
          }
      });
  }
  else throw("Missing admin ID");
}

function editAdmins(uid, action, cb) {
  if(uid && action) {
      var aid = activityBody._id;
      $.ajax({
          url: contentUrl + (contentUrl.endsWith("/") ? '' : '/') 
              + "contents/" + aid + "/actions/" 
              + (action=='add' ? "addAdmin" : "removeAdmin"),
          method: 'POST',
          headers: {
              Authorization: "Bearer " + userToken
          },
          data: {userId:uid},
          success: function(d){
              //console.log(d);
              _growl.notice({message:"Admin list successfully modified"});
              if(cb) cb(d.admins);
          },
          error: function(e) {
              console.log(e);
              _growl.error({message: "Error editing admins"});
          }
      });
  }
  else throw("Missing admin ID or action");
}


function initAdminTool() {
  //TODO popup conferma aggiunta
  var users = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('email'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      //prefetch: '../data/films/post_1960.json',
      remote: {
          url: baseUrl + (baseUrl.endsWith("/") ? '' : '/') + "activities/users/%QUERY",
          headers : {
              Authorization: "Bearer " + userToken
          },
          wildcard: '%QUERY',
          filter: function (users) {
              $(".tt-dataset").addClass("container-fluid");            
              var notAdmins = [];
              for(var i=0; i<users.length; i++) {                
                  if((_form_ds.admins.indexOf(users[i]._id) == -1) && users[i]._id != activityBody.owner) {
                      notAdmins.push(users[i]);
                  }
              }
              // Map the remote source JSON array to a JavaScript object array
              return $.map(notAdmins, function (user) {
                  return {
                      uid: user._id,
                      email: user.email,
                      name: ((user.name ? user.name : '') + (user.surname ? ' ' + user.surname : '')),
                      avatar: user.avatar || "/img/avatar.png"
                  };
              });
          }
      }
  });

  $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
      var uid = suggestion.uid;
      if(uid) {
          editAdmins(uid, 'add', function(newadmins) {
              _form_ds.admins = newadmins;            
              getAdmins(newadmins, renderAdmins);
          });
      }
  });


  $('#searchusers .typeahead').typeahead(null, {
      display: 'email',
      source: users,
      templates: {
          suggestion: Handlebars.compile($("#htpl-tah-menu").html())
      }
  });
}