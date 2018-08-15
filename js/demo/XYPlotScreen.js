// Copyright 2017, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var XYDataSeries = require( 'GRIDDLE/XYDataSeries' );
  var XYPlot = require( 'GRIDDLE/XYPlot' );

  /**
   * @constructor
   */
  function XYPlotScreen() {


    Screen.call( this,

      // createModel
      function() {
        return {
          step: function() {
          }
        };
      },

      // createView
      function( model ) {
        var screenView = new ScreenView( { layoutBounds: new Bounds2( 0, 0, 768, 504 ) } );
        var time = 0;
        var plot = new XYPlot( { backgroundFill: '#efecd9' } );
        var plotPanel = new Panel( plot, {
          fill: '#efecd9',
          xMargin: 10,
          yMargin: 10
        } );
        screenView.addChild( plotPanel );
        var series = new XYDataSeries( { color: Color.BLUE } );
        plot.addSeries( series, false );
        var forward = true;
        var count = 0;
        screenView.step = function() {
          series.addPoint( time, -Math.abs( -Math.sin( time / 100 + count ) * 400 * 0.8 ) );
          time = time + ( forward ? 1 : -1 );

          if ( time > 400 ) {
            forward = false;
            count++;
          }
          if ( time < 0 ) {
            forward = true;
            count++;
          }
        };
        return screenView;
      },

      // options
      {
        name: 'XY Plot',
        backgroundColorProperty: new Property( '#fff' )
      }
    );
  }

  griddle.register( 'XYPlotScreen', XYPlotScreen );

  return inherit( Screen, XYPlotScreen );
} );