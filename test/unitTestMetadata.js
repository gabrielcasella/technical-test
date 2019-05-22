'use strict';

var expect = require( 'chai' ).expect;

var myMetadata = require( '../metadata/metadata' );

describe( 'myMetadata', function() {
    it( `successful invocation`, function( done ) {

        myMetadata.handler( {}, { /* context */ }, (err, result) => {
            try {
                expect( err ).to.not.exist;
                expect( result ).to.exist;
                expect( result.body ).to.be.a('string').that.include('myob-technical-test');
                done();
            } catch( error ) {
                done( error );
            }
        });
    });
});