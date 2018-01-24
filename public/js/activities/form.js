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

function removePicture(elem, id){
    bootbox.confirm("Vuoi rimuovere l'immagine "+id, function(result){
      if (result) {
        $(elem).parent().remove();
        for (var i = 0; i < images_array_fd.length; i++)
            if (images_array_fd[i].id === id) {
                images_array_fd.splice(i, 1);
            }
        }
    });
}

function imageIsPresent(imgid, imgarr) {
    for(var i=0; i<imgarr.length; i++) {
        if(imgarr[i].id == imgid) 
            return false
    }
    return true;
}

function loadImagePreview(input) {    
    if (input.files && input.files[0]) {
        var imgid = 'img-' + input.files[0].name.replace(/\s/g,'')
        if(imageIsPresent(imgid, images_array_fd)) {
            var reader = new FileReader();
            var imgtpl = Handlebars.compile($("#htpl-img-f").html());

            reader.onload = function(e) {
                let _id = imgid;
                let objectURL = URL.createObjectURL(input.files[0]);
                $('#f_imageContainer').append(imgtpl({id:_id, src:objectURL}));

                let file = input.files[0];
                let formData = new FormData();
                formData.append(file.name.split(".")[0], file, file.name);
                images_array_fd.push({id:_id, formData: formData});
            };
            reader.readAsDataURL(input.files[0]);
        }
        else _growl.warning({message: "Image already selected"})
        
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

function initMapEdit() {
    var latitude = activityBody.lat || _form_ds.lat;
    var longitude = activityBody.lon || _form_ds.lon;

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


function initMap(title, latitude, longitude) {
    var map = new GMaps({
        div: '#map',
        scrollwheel: false,
        lat: latitude,
        lng: longitude,
        zoom: zoom,
        title: title
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
                address = results[0].formatted_address;
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


function loadCat(cb) {
    $.ajax({
        url:contentUrl + "categories/",
        success: function(data) {
            var cats = data.categories;
            
            if(activityBody) {
                for(var j=0; j<cats.length; j++) {
                    cats[j].checked = false;
                    for(var i=0; i<activityBody.category.length; i++) {
                        if(activityBody.category[i]._id == cats[j]._id) {
                            cats[j].checked = true;
                            break;
                        }
                    }
                }
            }
            if(cb) cb(cats);
        }
    });
}



function loadContent(cb) {
    var formcontent = Handlebars.compile($("#htpl-form").html());
    if(activityBody) {
        var hmodel = activityBody;
        for(var i=0; i<activityBody.images.length; i++) {
            if(typeof activityBody.images[i] == "string") { //first editmode activation, img not formatted
                var imgurl = normalizeImgUrl(activityBody.images[i]);
                var id = activityBody.images[i].split('/').pop();
                hmodel.images[i] = {id:id, src:imgurl};
            }
            else hmodel.images[i] = activityBody.images[i]; //editmode already activated
        }
        loadCat(function(cats) {
            hmodel.cats = cats;
            $("#formbox").html(formcontent(hmodel));
            if(cb) cb()
        });
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
        _growl.notice({message:"Update success"})
        doView(response._id);
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

  if(images_array_fd.length > 0 ) {
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
    else if(cb) cb([]);
}


function editAdmins(uid, action, cb) {
    var isAdd = action == 'add';
    if(uid && action) {
        var aid = activityBody._id;
        bootbox.confirm("Vuoi " + (isAdd ? "aggiungere" : "rimuovere") + " l'amministratore?", function(result){            
            if(result) {
                $.ajax({
                    url: contentUrl + (contentUrl.endsWith("/") ? '' : '/') 
                        + "contents/" + aid + "/actions/" 
                        + (isAdd ? "addAdmin" : "removeAdmin"),
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
        })
    }
    else throw("Missing admin ID or action");
}


function initAdminTool() {
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



function normalizeImgUrl(url) {
    /*
    if(isURL(url)) return url;
    else {
        //TODO verificare sia un formato ObjectID valido
        return baseUrl + "activities/image/" + url
    }
    */
    //TODO sostituire con codice sopra dopo modifica contentms
    var ret = url;
    if(url.startsWith(uploadUrl)) {
        var id = url.split('file/')[1];
        ret = baseUrl + "activities/image/" + id;
    }
    return ret;
}


function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locater
    return pattern.test(str);
}