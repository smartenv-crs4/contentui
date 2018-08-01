var config = require('propertiesmanager').conf;
var codified_data=require('codified_data');
codified_data.setup({
    host: config.redisCache.host, // default value
    ttl:config.redisCache.ttl, // default value
});

module.exports = codified_data;




// const uuidv1 = require('uuid/v1');
// const NodeCache = require( "node-cache" );
// let myCache = new NodeCache( { stdTTL: 10, checkperiod: 120 } );
//
// //Middleware to parse DB query fields selection from request URI
// //Adds dbQueryFields to request
// exports.setKey = function (value,callback) {
// var uuId=uuidv1();
//     myCache.set( uuId, value, function( err, success ){
//         callback(null,uuId);
//     });
//
// };
//
//
// exports.getKey = function (key,callback) {
//     myCache.get( key, function( err, value ){
//         if( !err ){
//             callback(null,value);
//         }else{
//             callback(err,null)
//         }
//     });
// };
//
// exports.deleteKey = function (key,callback) {
//     myCache.del( key );
//     if (callback)
//         callback(null,key);
// };
//
//
// exports.flushAll = function () {
//     myCache.flushAll()
// };
//
//
// exports.setNewCache = function (stdTTL,checkperiod) {
//     myCache.close();
//     myCache = new NodeCache( { stdTTL: stdTTL, checkperiod: checkperiod } );
// };
