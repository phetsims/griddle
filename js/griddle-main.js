// Copyright 2014-2017, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 */
define( function( require ) {
  'use strict';

  // modules
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var BarChartNodeScreen = require( 'GRIDDLE/demo/BarChartNodeScreen' );
  var GriddleScreenView = require( 'GRIDDLE/demo/GriddleScreenView' );
  var Screen = require( 'JOIST/Screen' );
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
      new BarChartNodeScreen(),
      new Screen( function() {return {};}, function() {return new GriddleScreenView();}, {
        name: 'Griddle Demo'
      } )
    ], simOptions ).start();
  } );
} );
