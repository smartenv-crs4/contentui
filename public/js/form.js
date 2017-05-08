/**
 * Created by albe on 27/03/2017.
 */

$(document).ready(function() {

  $("#addContent").click(function(e) {
    console.log("click");
    addContent();
  });

  $("#doSearch").click(function(e) {
    console.log("doSearch");
    search();
  });

  App.init();

  initMap();

});


function initMap() {
  GoogleMap.initGoogleMap(39.21054, 9.1191, 13);  // lat, lon, zoom
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

  console.log($('#fileupload').prop('files'));

  var data = {
    name: name,
    type: "eventa_promotions",
    description: description,
    published: published,
    town: town,
    category: [1],
    lat: lat,
    lon: lng
  };


  $.post(contentsUrl + "contents/?fakeuid=abcbabcabcbabcbabcba1234", data )
    .done(function(msg){
      console.log("RESPONSE DA post su contents: " + JSON.stringify(msg));
      bootbox.alert("Content Added! "+ JSON.stringify(msg));
    })
    .fail(function(xhr, status, error) {
      console.log("ERROR DA post su contents: " +error);
      bootbox.alert("Warning! Error adding content " +error );
    });


}

