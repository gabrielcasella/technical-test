'use strict';

var expect = require( 'chai' ).expect;

var myApplication = require( '../application/application' );

describe( 'myLambda', function() {
    it( `successful invocation`, function( done ) {

        var context = {
            succeed: function( result ) {
                expect( result.body ).to.be.a('string').that.include('Hello World!');
                done();
            },
            fail: function() {
                done(new Error('never context.fail'));
            }
        }

        myApplication.handler( {}, { /* context */ }, (err, result) => {
            try {
                expect( err ).to.not.exist;
                expect( result ).to.exist;
                expect( result.body ).to.be.a('string').that.include('Hello World!');
                done();
            } catch( error ) {
                done( error );
            }
        });
    });
});