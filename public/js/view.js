/**
 * Created by albe on 27/03/2017.
 */

let TOKEN = "?fakeuid=abcbabcabcbabcbabcba1234";
let latitude = 39.21054;
let longitude = 9.1191;
let zoom = 12;


$(document).ready(function() {

  console.log(activityBody);
  $("#name").text(activityBody.name);
  $("#description").text(activityBody.name);


  $('#datetimepicker12').datetimepicker({
    inline: true,
    format: 'DD/MM/YYYY',
    allowInputToggle: true,
    useCurrent : true
  });


  var imgThumb = $("#img-thumb").html();
  var imageContainer = document.getElementById("imageContainer");

  for(let i=0; i<activityBody.images.length; i++) {
    let col = i % 4;
    let img = $(imgThumb).find("img").attr("src", activityBody.images[0]);
    $("#imageContainer div[data-img-thumb-pos='" + col + "\']").append(img).append('<br>'); //.find("img").attr("src", activityBody.images[0]));
  }


  var catBox = $("#cp-cats").html();

  for(let i=0; i<activityBody.category.length; i++) {
     $.ajax(contentsUrl + "categories/"+activityBody.category[i]+TOKEN)
       .done(function(cat) {
        var col = i%4;
        $("#catDrop div[data-cp-cbox-pos='" + col + "\']").append($(catBox).append(cat.name));
       })
  }


  App.init();
});










