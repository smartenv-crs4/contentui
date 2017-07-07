/**
 * Created by Alessandro on 29/03/17.
 */



// init default values in usser profile if data is empty from db
function DefaultValuesInit(){
    jQuery(document).ready(function() {
        SetDefaultValues();
    });
}

// set the default values in profile if data is empty from db
function SetDefaultValues(){
    console.log("-_-_-_-_-_-_-_-_-_-_-_-_-_ Set DEfault Values");
    var elements= jQuery("[data-defaultEmptyValue]");
    elements.each(function( index ) {
        var dataDefaultEmptyValue=this.getAttribute('data-defaultEmptyValue');
        if(!(this.innerHTML.match(/[^\t\v\0\s\n\r]/igm)))
            this.textContent=dataDefaultEmptyValue;
    });
}