// Copyright 2014-2015, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 */
define( function( require ) {
  'use strict';

  // modules
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var VerticalBarChartScreen = require( 'GRIDDLE/demo/VerticalBarChartScreen' );
  var XYPlotScreen = require( 'GRIDDLE/demo/XYPlotScreen' );

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
      new XYPlotScreen(),
      new VerticalBarChartScreen()
    ], simOptions ).start();
  } );
} );
