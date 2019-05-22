'use strict';

var expect = require( 'chai' ).expect;

var myApplication = require( '../application/application' );

describe( 'myApplication', function() {
    it( `successful invocation`, function( done ) {

        process.env.TableName = 'UnitTest';
        process.env.ApplicationName = 'myobUnitTest';

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