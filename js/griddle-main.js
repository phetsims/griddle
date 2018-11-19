// Copyright 2014-2018, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 */
define( function( require ) {
  'use strict';

  // modules
  var GriddleDemoScreenView = require( 'GRIDDLE/demo/GriddleDemoScreenView' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var griddleTitleString = require( 'string!GRIDDLE/griddle.title' );

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  SimLauncher.launch( function() {
    // Create and start the sim
    new Sim( griddleTitleString, [
      new Screen( function() {return {};}, function() {return new GriddleDemoScreenView();}, {
        name: 'Griddle Demo'
      } )
    ], simOptions ).start();
  } );
} );
