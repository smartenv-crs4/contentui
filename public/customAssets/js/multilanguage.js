/**
 * Created by Alessandro on 07/10/16.
 */


let lang=window.localStorage.lng;
let titleMultilanguage={},descriptionMultilanguage={};


// initMultilanguage

function initMultilanguage(callback){

    ThrowWhenUnderscoreIsLoad(function(err,done){
        if(callback) callback(err,done);
    });

    lang=window.localStorage.lng;
}


function MultilanguageEditInit(){
    lang=window.localStorage.lng;
    // lang=$('#multilanguageselect').get(0).value;

    var multilanguageselect=$('#multilanguageselect') || null;

    if(multilanguageselect){
        multilanguageselect.change(function() {
            lang=this.value;

            // console.log("Language:--->"+ lang);
            // console.log(titleMultilanguage[lang]);

            if(!(titleMultilanguage[lang]))
                titleMultilanguage[lang] = "";

            if(!(descriptionMultilanguage[lang]))
                descriptionMultilanguage[lang] = "";

            $('#promotionTitle').val(titleMultilanguage[lang]);
            $('#promotionDescription').val(descriptionMultilanguage[lang]);

        });

        multilanguageselect.val(window.localStorage.lng).change();
    }
}


function getCurrentLanguageTitle(){
    return titleMultilanguage[lang];
};

function getCurrentLanguageDescription(){
    return descriptionMultilanguage[lang];
};




//  transform text with language tags to json
function createJsonMultilanguage(content,multilanguage){
    if(content.search(/\[\[\w{2}\]\]/igm)>=0){
        let indexStartTag,indexEndTag;
        let tmpLang;
        indexStartTag=content.search(/\[\[\w{2}\]\]/igm);
        do{
            indexStartTag+=2;// +2 due to [[
            tmpLang=content.substr(indexStartTag,2);
            indexEndTag=content.search(new RegExp("\\[\\[\\/\\" + tmpLang + "\\]\\]","igm"));
            multilanguage[tmpLang]=content.substring(indexStartTag+4,indexEndTag); //+4 due to xx]]
            content=content.substr(indexEndTag+7);// 7 due to [[/xx]]
            indexStartTag=content.search(/\[\[\w{2}\]\]/igm) ;
        }while (indexStartTag>=0);

    }else{
        multilanguage[window.localStorage.lng]=content;
    }
    // console.log("|||||||JSON multilanguage||||||||");
    // console.log(multilanguage);
}


// call function to transform text with title language tags to json
function initTitleJsonMultilanguage(content, nsKey){
    titleMultilanguage = {};
    createJsonMultilanguage(content,titleMultilanguage);
    addCurrentLanguageContentToI18n(titleMultilanguage,"title",nsKey);
}


// call function to transform text with description language tags to json
function initDescriptionJsonMultilanguage(content,nsKey,maxSize,spaceRefactor){
    descriptionMultilanguage={};
    createJsonMultilanguage(content,descriptionMultilanguage);
    addCurrentLanguageContentToI18n(descriptionMultilanguage,"description",nsKey,maxSize,spaceRefactor);
}


function AddUndescoreJS(callback){
    tmpScript=document.createElement("script");
    tmpScript.type = "text/javascript"; // set the type attribute
    tmpScript.src = config.contentUIUrl + "/node_modules/async/dist/async.min.js"; // make the script element load file
    tmpScript.onload = function () { // when underscore is loaded
        callback(null,"Ok");
    };
    // finally insert the js element to the body element in order to load the script
    document.body.appendChild(tmpScript);
}


function ThrowWhenUnderscoreIsLoad(callback){
    if(!callback) callback=function(err,done){};
    if(window._===undefined){
        AddUndescoreJS(callback);
    }else {
        callback(null,"Ok");
    }
}


function addCurrentLanguageContentToI18n(multilanguage, field, nskey, maxSize, spaceRefactor){

    let tmpIndex;
    let oldValue;
    _.each(multilanguage, function(value,key) {
        if(value.length>0){
            if(maxSize){
                tmpIndex=value.substring(maxSize, maxSize+100).indexOf(" ");
                tmpIndex= tmpIndex >=0 ? tmpIndex+maxSize : maxSize;
                oldValue=value;
                value= value.substring(0, tmpIndex);
                if(oldValue.length>value.length)
                    value+="...";

            }
            if(spaceRefactor){
                let dif=200-value.length;
                for(let counter=0;counter<dif;++counter){
                    value+=spaceRefactor;
                }
            }

            addResourcetoi18nDictionary(key, "translation", (nskey ? nskey:"promo_multilanguage")+ "." + field, value);
        }
    });

}

// function addCurrentLanguageContentToI18n(multilanguage,field,nskey,maxSize,spaceRefactor){
//     let tmpIndex;
//     let oldValue;
//     async.eachOf(multilanguage, function(value,key, callback) {
//         if(value.length>0){
//             if(maxSize){
//                 tmpIndex=value.substring(maxSize, maxSize+100).indexOf(" ");
//                 tmpIndex= tmpIndex >=0 ? tmpIndex+maxSize : maxSize;
//                 oldValue=value;
//                 value= value.substring(0, tmpIndex);
//                 if(oldValue.length>value.length)
//                     value+="...";
//
//             }
//             if(spaceRefactor){
//                     let dif=200-value.length;
//                     for(let counter=0;counter<dif;++counter){
//                         value+=spaceRefactor;
//                     }
//             }
//
//             addResourcetoi18nDictionary(key, "translation", (nskey ? nskey:"promo_multilanguage")+ "." + field, value);
//         }
//         callback();
//     });
// }


function addResourcetoi18nDictionary(lng,ns,key,value){
    i18next.addResource(lng, ns, key, value);
}


// transform multilangiage json to text with language tags
function getContentWithTags(content){

    // assuming openFiles is an array of file names
    let contentwithTags="";
    _.each(content, function(value,key) {
        if(value.length>0)
            contentwithTags+="[["+key+"]]" + value + "[[/"+key+"]]";

    });

    return contentwithTags;
}

// transform multilangiage json to text with language tags
// function getContentWithTags(content,callbackcontentWithTags){
//     // assuming openFiles is an array of file names
//     let contentwithTags="";
//     async.eachOf(content, function(value,key, callback) {
//         if(value.length>0)
//             contentwithTags+="[["+key+"]]" + value + "[[/"+key+"]]";
//
//         callback();
//
//     }, function(err) {
//
//         if( err ) { // never reacheable due no error callback
//             console.log(err);
//             if(callbackcontentWithTags) callbackcontentWithTags(err,null);
//         } else {
//             if(callbackcontentWithTags) callbackcontentWithTags(null,contentwithTags);
//         }
//     });
// }




// get title with language tags
function getmultilanguageTitle(currentDescription){
    //add current description
    titleMultilanguage[lang]=currentDescription;

    // get tagged content
    return(getContentWithTags(titleMultilanguage));
}



// get description with language tags
function getmultilanguageDescription(currentDescription){
    //add current description
    descriptionMultilanguage[lang]=currentDescription;

    // get tagged content
   return getContentWithTags(descriptionMultilanguage);

}





