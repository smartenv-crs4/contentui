
var should = require('should');
var _ = require('underscore')._;
var async = require('async');
var request = require('request');
var app = require('../app');
var Port = 3055;
var server;
var jsonDb=require('../routes/jsonDb');


describe('Users API', function () {

    before(function (done) {
        jsonDb.setNewCache(3,100);
        app.set('port', process.env.PORT || Port);

        server = app.listen(app.get('port'), function () {
            console.log('TEST Express server listening on port ' + server.address().port);
            done();
        });
    });

    after(function (done) {
        server.close();
        done();
    });


    beforeEach(function (done) {
       jsonDb.flushAll();
       done();
    });


    afterEach(function (done) {
       done();
    });



    describe('SETKEY', function () {

        it('should set a KEY', function (done) {


            jsonDb.setKey("valore",function(err, uuid){
                uuid.should.be.not.null;
                done();
            });

        });
    });

    describe('SETKEY', function () {

        it('should Get a KEY', function (done) {


            jsonDb.setKey("valore",function(err, uuid){
                uuid.should.be.not.null;
                jsonDb.getKey(uuid,function(err,val){
                   val.should.be.equal('valore');
                    done();
                });

            });

        });
    });


    describe('SETKEY', function () {
        this.timeout(10000);
        it('should test TTL', function (done) {
            jsonDb.setKey("valore",function(err, uuid){
                uuid.should.be.not.null;
                jsonDb.getKey(uuid,function(err,val){
                    val.should.be.equal('valore');
                    setTimeout(function(){
                        jsonDb.getKey(uuid,function(err,val) {
                            val.should.be.equal('valore');
                            setTimeout(function(){
                                jsonDb.getKey(uuid,function(err,val) {
                                    should(val).be.equal(null || undefined);
                                    done();
                                });
                            }, 3000);
                        });
                    }, 1000);
                });

            });

        });
    });


});
