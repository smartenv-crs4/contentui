/**
 * Created by albe on 27/03/2017.
 * Mantained by Dino from 04/17
 */

var zoom = 12;
var images_array_fd = [];
var images_to_remove = [];

var _form_ds = {
  admins     : [],
  htplAdmin  : undefined,
  lat: 39.21054,
  lon: 9.1191
}
var _growl = $.growl; //wa removeAdmin jquery+growl scope.... (?)


function deleteUploadedPicture(id, cb) {
    jQuery.ajax({
        url: uploadUrl + "file/" + id,
        headers: {
          Authorization: "Bearer " + userToken
        },
        type: 'DELETE',
        success: function(data) {
            cb(data.filecode);
        },
        error: function(xhr, status) {
            cb(null, {status:status})
        }
    });
}

function removePicture(elem, id){
    bootbox.confirm("Vuoi rimuovere l'immagine "+id, function(result){
        if (result) {
            if(imageIsPresent(id, images_array_fd)) {
                for (var i = 0; i < images_array_fd.length; i++) {
                    if (images_array_fd[i].id === id) {
                        images_array_fd.splice(i, 1);
                        $(elem).parent().remove();
                        break;
                    }
                }
            }
            else {
                images_to_remove.push(id);
                $(elem).parent().remove();
            }
        }
    });    
}

function imageIsPresent(imgid, imgarr) {
    for(var i=0; i<imgarr.length; i++) {
        if(imgarr[i].id == imgid) 
            return true
    }
    return false;
}

function loadImagePreview(input) {    
    if (input.files && input.files[0]) {
        if(input.files[0].size > 307200) {
            _growl.error({message: "Image size too big (max 300k)"});
            return;
        }
        var imgid = 'img-' + input.files[0].name.replace(/\s/g,'')
        if(!imageIsPresent(imgid, images_array_fd)) {
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
            //cb(uploadUrl+"file/"+data.filecode);
            cb(data.filecode);
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
    var latitude = _form_ds.lat;
    var longitude = _form_ds.lon;

    if(typeof activityBody != "undefined" && activityBody.lat && activityBody.lon) {
        latitude = activityBody.lat;
        longitude = activityBody.lon;
    }

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
            
            geocodeLatLng(latitude, longitude, function(address) {
                $('#fAddressChanged').fadeIn();
                $('#fAddressChanged .newAdr').text(address);
                $("#changeAddress").off("click");
                $("#changeAddress").click(function() {
                    _addressFound = address;
                    $("#f_address").val(address);
                    $('#fAddressChanged').hide();
                })
                
            });   
        }
    });
    _map = map;
    var marker = map.addMarker({
        lat: latitude,
        lng: longitude
    });
/*    
    geocodeLatLng(latitude, longitude, function(address) {
        $('#f_address').val(address);
    });
*/
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
/*
    map.drawOverlay({
        lat: latitude,
        lng: longitude,
        content: '<div class="overlay"><h3>'+title+'</h3></div>'
    });
*/

    //geocodeLatLng(latitude, longitude);
}


function geocodeLatLng(lat, lng, cb) {
    let geocoder = new google.maps.Geocoder;
    let latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    let address = "Unknown address";
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
            if (results[1]) {
                address = results[0].formatted_address;
            } 
            if(cb) cb(address);
        }
        else {
            _growl.warning({message: "Gmaps was unable to find this address"})
        }
    });
}


function loadCat(cb) {
    $.ajax({
        url:contentUrl + "categories/",
        success: function(data) {
            var cats = data.categories;
            
            if(typeof activityBody != "undefined") {
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
    var hmodel = {};
    if(typeof activityBody != 'undefined') {
        
        hmodel = activityBody;
        for(var i=0; i<activityBody.images.length; i++) {
            if(typeof activityBody.images[i] == "string") { //first editmode activation, img not formatted
                var imgurl = common.normalizeImgUrl(activityBody.images[i]);
                var id = activityBody.images[i].split('/').pop();
                hmodel.images[i] = {id:id, src:imgurl};
            }
            else hmodel.images[i] = activityBody.images[i]; //editmode already activated
        }
        loadCat(function(cats) {
            hmodel.cats = cats;
            initTitleJsonMultilanguage(activityBody.name)
            initDescriptionJsonMultilanguage(activityBody.description)
            $("#formbox").html(formcontent(hmodel));
            if(cb) cb()
        });
    }
    else loadCat(function(cats) {
        hmodel.cats = cats;
        $("#formbox").html(formcontent(hmodel));
        if(cb) cb()
    });
}


function getFormData() {
    //TODO validations!!!!
    //var name = $('#f_name').val();
    var name = '';
    name=getContentWithTags(titleMultilanguage);
    
    //var description = $('#f_description').val();
    var description = '';
    description=getContentWithTags(descriptionMultilanguage);
    var address = $('#f_address').val();
    var facebook = $("#f_fb").val();
    var twitter = $("#f_tw").val();
    var phone = $("#f_phone").val();
    var email = $("#f_email").val();
    var instagram = $("#f_inst").val();
    var tripadvisor = $("#f_ta").val();
    var vat = $("#f_vat").val();

    var category_array = $('input[name="category"]:checked').map(function () {
        return this.value;
    }).get();

    var contentData = {
        name: name,
        vat: vat,
        type: "activity",
        description: description,
        address: address,
        category: category_array.slice(),
        facebook:facebook,
        instagram:instagram,
        email:email,
        phone:phone,
        tripadvisor:tripadvisor,
        twitter:twitter,
        images:[],
        lat: _form_ds.lat,
        lon: _form_ds.lon
    };

    return contentData;
}

function addContent() {
    positionCheck(function(edit) {
        if(!edit) {
            var contentData = getFormData();

            if (images_array_fd.length > 0 ) {
                images_array_fd.forEach(function (fd_img) {
                    getUploadmsImageURL(fd_img.formData, function (img_url) {        
                        contentData.images.push(img_url);
                        if (contentData.images.length === images_array_fd.length) {
                            storeContentToContentms(contentData, true);
                        }
                    });
                });
            } 
            else storeContentToContentms(contentData, true);
        }
    })
}


function positionCheck(cb) {
    //geolocate failed e indirizzo attuale diverso da quello salvato
    if((!_addressFound && !activityBody)
        ||(!_addressFound && $("#f_address").val() != activityBody.address)) {
        bootbox.confirm("The system can't geolocate the activity address, would you set the coordinates on the map manually?", function(result){            
            cb(result)
        });
    }
    else if(_addressFound != $("#f_address").val()) {
        bootbox.confirm("The inserted address has changed, would you check the coordinates on the map?", function(result){            
            cb(result)
        });
    }
    else cb(false);
}

function updateContent(){
    if(!$("#activityForm")[0].checkValidity()) {
        _growl.error({message:"Invalid data, please check the red bordered fields"})
        return;
    }

    positionCheck(function(edit) {
        if(!edit) {
            //rimozione immagini da uploadms
            for(var i=0; i<images_to_remove.length; i++) {
                deleteUploadedPicture(images_to_remove[i], function(r, e) {
                    if(e) {
                        var msg = ((e.status == 401) ? "You are not the owner of the image " : "Unable to delete the image ") + images_to_remove[i];
                        _growl.warning({message:msg}); //unauthorized is non blocking, the image remains available
                    }
                });
            }
            images_to_remove = []; //important!

            contentData = getFormData();
            contentData.images = $('img[name="image"]').map(function () {
                if (!this.src.match("^blob"))
                    return $(this).attr("data-id"); //solo quelle senza blob (img già uploadate)
            }).get();

            var oldImagesLength = contentData.images.length;

            if(images_array_fd.length > 0 ) {
                images_array_fd.forEach(function (fd_img) {
                    getUploadmsImageURL(fd_img.formData, function (img_url) {
                        contentData.images.push(img_url);
                        // bisogna considerare le immagini già presenti per capire se le ha caricate tutte
                        if ((contentData.images.length - images_array_fd.length) === oldImagesLength) {
                            //console.log("contentData: ", JSON.stringify(contentData));
                            storeContentToContentms(contentData);
                        }
                    });
                });
            } 
            else storeContentToContentms(contentData);
        }
    })
}

function storeContentToContentms(contentData, ins){
    $.ajax({
        url: contentUrl + "contents/" + (ins ? '' : activityBody._id),
        headers: {
            Authorization: "Bearer " + userToken
        },
        type: ins ? "POST" : "PUT",
        contentType: 'application/json',
        data: JSON.stringify(contentData),
        success: function (response) {
            images_array_fd = []; //!!!important
            _growl.notice({message:"Update success"})
            if(ins) window.location.href = baseUrl + "activities/" + response._id;
            else doView(response._id);
        },
        error: function (response) {
            var msg = response.responseJSON.message ? ': ' + response.responseJSON.message : '';
            _growl.error({message: "Error updating content" + msg});
        }
    });
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
                      avatar: userUiUrl + "users/actions/getprofileimage/" + user.avatar
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