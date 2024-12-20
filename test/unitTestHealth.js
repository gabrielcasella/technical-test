'use strict';

var expect = require( 'chai' ).expect;

var myHealth = require( '../health/health' );

describe( 'myHealth', function() {
    it( `successful invocation`, function( done ) {

        process.env.TableName = 'UnitTest'
        process.env.HostName = 'vcwgpbc01m.execute-api.ap-southeast-2.amazonaws.com';
        process.env.Stage = 'Prod';

        myHealth.handler( {}, { /* context */ }, (err, result) => {
            try {
                expect( err ).to.not.exist;
                expect( result ).to.exist;
                expect( result.body ).to.be.a('string').that.include('API');
                expect( result.body ).to.be.a('string').that.include('Database');
                done();
            } catch( error ) {
                done( error );
            }
        });
    });
});