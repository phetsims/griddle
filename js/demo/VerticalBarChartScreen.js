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
  var VerticalBarChart = require( 'GRIDDLE/VerticalBarChart' );
  var VerticalBarNode = require( 'GRIDDLE/VerticalBarNode' );

  /**
   * @constructor
   */
  function VerticalBarChartScreen() {

    Screen.call( this,

      // createModel
      function() {
        var kineticEnergyProperty = new Property( 100 );
        return {
          kineticEnergyProperty: kineticEnergyProperty,
          step: function() {
            kineticEnergyProperty.set( 100 * Math.abs( Math.sin( Date.now() / 1000 ) ) );
          }
        };
      },

      // createView
      function( model ) {

        return new ScreenView( {
          children: [ new VerticalBarChart( [ new VerticalBarNode( model.kineticEnergyProperty, {
            fill: 'red',
            lineWidth: 1
          } ) ] ) ]
        } );
      },

      // options
      {
        name: 'Bar Chart',
        backgroundColorProperty: new Property( '#fff' )
      }
    );
  }

  griddle.register( 'VerticalBarChartScreen', VerticalBarChartScreen );

  return inherit( Screen, VerticalBarChartScreen );
} );