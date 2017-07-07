var defaultResizeConfig =
{
  "formats": 
  {
    "thumbnail":
    {
      "maxSize":  50
    },
    "medium":
    {
      "maxSize":  300
    },
    "large":
    {
      "maxSize":  500
    }
  }
}

function resizeImage(imgField, msUploadUrl, doSuccess, doError, config, beforeSend)
{
  if(config)
  {
    if(!config.formats)
    {
      console.log("Invalid config object (missing formats parameter)");
      return;
    }
    else if(Object.keys(config.formats).length == 0)
    {
      console.log("Formats list is blank");
      return;
    }
    else
    {
      var valid = true;
      for(var i in config.formats)
      {
        if(isNaN(config.formats[i].maxSize))
        {
          valid = false;
          console.log("'" + i + "' format: invalid maxSize parameter");
        }
        if(!valid)
        {
          return;
        }        
      }
    }
  }
  else
  {
    config = defaultResizeConfig;
  }
    
  // Read in file
  var f = jQuery("#" + imgField)[0];
  var file =  f.files[0];
    
  var imgList = [];

  // Ensure it's an image
  if(file.type.match(/image.*/)) 
  {             
    // Load the image
    var reader = new FileReader();
    
    reader.onload = function (readerEvent) 
    {    
      var image = new Image();
      image.onload = function (imageEvent) 
      {               
        for(var suf in config.formats)
        {          
          // Resize the image
          var canvas = document.createElement('canvas'),
            maxSize = config.formats[suf].maxSize,            
            width = image.width,
            height = image.height;
            
          if (width > height) 
          {
            if (width > maxSize) 
            {
              height *= maxSize / width;
              width = maxSize;
            }
          } 
          else 
          {
            if (height > maxSize) 
            {
              width *= maxSize / height;
              height = maxSize;
            }
          }                  
            
          canvas.width = width;
          canvas.height = height;
  
          canvas.getContext('2d').drawImage(image, 0, 0, width, height);

          //console.log(file.type);
          var dataUrl = canvas.toDataURL(file.type);

                       
          var resizedImage = dataURLToBlob(dataUrl);
          
          imgList.push({
            "suffix": suf,
            "blob": resizedImage,
            "origName" : file.name
          });                                      
        }                
        
        // fare l'upload
        uploadImages(imgList, msUploadUrl, doSuccess, doError, beforeSend);
      }
      image.src = readerEvent.target.result;

    }
    reader.readAsDataURL(file);
  }
}


/* Utility function to convert a canvas to a BLOB */
function dataURLToBlob(dataURL) {
  var BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(',');
    var contentType = parts[0].split(':')[1];
    var raw = parts[1];

    return new Blob([raw], {type: contentType});
  }

  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);
  for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], {type: contentType});
}


function uploadImages(imgList, msUploadUrl, doSuccess, doError, beforeSend)
{
  var form = jQuery('form')[0];
  var formData = new FormData(form);
  
  for(var i in imgList)
  { 
    var name = "";
    var n =  imgList[i].origName;
    var ns = n.split(".");
  
    if(ns.length > 1)
    {
      for(var j = 0; j < ns.length - 1; j++)
      {
        var d = "";
        if(j < ns.length - 2)
        {
          d = "."
        }
        name += ns[j] + d;
      }
      name += "_" + imgList[i].suffix + "." + ns[ns.length -1];
    }
    else
    {
      name = n + "_" + imgList[i].suffix;
    }
    
    formData.append(imgList[i].suffix, imgList[i].blob, name);    
  }
    
  jQuery.ajax({
    url: msUploadUrl,
    data: formData,
    //cache: false,
    contentType: false,
    processData: false,
    type: "POST",
    success: function(data){
      if(doSuccess)
      {
        doSuccess(data);
      }
    },
    error: function(xhr)
    {
      if(doError)
      {
        doError(xhr);
      }
    },
    beforeSend: function(xhr, settings)
    {
      if(beforeSend)
      {
        beforeSend(xhr, settings);
      }
    }
  });
  
  
  
}
