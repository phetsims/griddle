// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main file for the Sun library demo.
 */
define( function( require ) {
  'use strict';

  // Imports
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var XYPlot = require( 'LIGHTBULB/XYPlot' );

  // Strings
  var simTitle = 'Sun demo';

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  SimLauncher.launch( function() {
    // Create and start the sim
    //Create and start the sim
    new Sim( simTitle, [
      new Screen( simTitle, null,
        function() {return {};},
        function( model ) {
          var screenView = new ScreenView();
          screenView.addChild( new XYPlot( {backgroundFill: '#efecd9'} ) );
          return  screenView;
        },
        { backgroundColor: '#fff' }
      )
    ], simOptions ).start();
  } );
} );
