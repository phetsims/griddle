// Copyright 2017, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var BarChart = require( 'GRIDDLE/BarChart' );

  /**
   * @constructor
   */
  function BarChartScreen() {

    Screen.call( this,

      // createModel
      function() { return { step: function() { } }; },

      // createView
      function( model ) {
        return new ScreenView( {
          children: [ new BarChart() ]
        } );
      },

      // options
      {
        name: 'Bar Chart',
        backgroundColorProperty: new Property( '#fff' )
      }
    );
  }

  griddle.register( 'BarChartScreen', BarChartScreen );

  return inherit( Screen, BarChartScreen );
} );