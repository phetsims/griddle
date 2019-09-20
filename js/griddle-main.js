// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 */
define( require => {
  'use strict';

  // modules
  const GriddleDemoScreenView = require( 'GRIDDLE/demo/GriddleDemoScreenView' );
  const Screen = require( 'JOIST/Screen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  const griddleTitleString = require( 'string!GRIDDLE/griddle.title' );

  const simOptions = {
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
