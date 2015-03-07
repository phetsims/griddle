// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var XYPlot = require( 'GRIDDLE/XYPlot' );
  var XYDataSeries = require( 'GRIDDLE/XYDataSeries' );

  // strings
  var simTitle = 'Griddle Demo';

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  SimLauncher.launch( function() {
    // Create and start the sim
    new Sim( simTitle, [
      new Screen( simTitle, null,
        function() {
          return {
            step: function() {
            }
          };
        },
        function( model ) {
          var screenView = new ScreenView( { layoutBounds: new Bounds2( 0, 0, 768, 504 ) } );
          var time = 0;
          var plot = new XYPlot( { backgroundFill: '#efecd9' } );
          screenView.addChild( plot );
          var series = new XYDataSeries( { color: 'blue' } );
          plot.addSeries( series );
          var count = 0;

          screenView.step = function() {
              var new_series = new XYDataSeries( { color: 'blue' } );
              plot.addSeries(new_series);
              new_series.setPoints(
                  new_series.range(0, plot.options.width),
                  new_series.range(0, plot.options.height).map(
                          function(i) {
                              return -(plot.options.height / 2) + 5 * Math.sin((i / 20) - (time / 8));
                          }));
              plot.clear();
              time = (time + 1) % 1000
          };
          return screenView;
        },
        { backgroundColor: '#fff' }
      )
    ], simOptions ).start();
  } );
} );
