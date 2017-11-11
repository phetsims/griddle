// Copyright 2017, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BarChartNode = require( 'GRIDDLE/BarChartNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Screen = require( 'JOIST/Screen' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Vector2 = require( 'DOT/Vector2' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function VerticalBarChartScreen() {

    Screen.call( this,

      // createModel
      function() {
        return {
          aProperty: new Property( 0 ),
          bProperty: new Property( 0 ),
          cProperty: new Property( 0 )
        };
      },

      // createView
      function( model ) {
        var aEntry = {
          property: model.aProperty,
          color: 'red'
        };
        var bEntry = {
          property: model.bProperty,
          color: 'green'
        };
        var cEntry = {
          property: model.cProperty,
          color: 'blue'
        };

        var barChartNode = new BarChartNode( [
          {
            entries: [ aEntry ],
            label: new Node()
          },
          {
            entries: [ bEntry ],
            label: new Node()
          },
          {
            entries: [ cEntry ],
            label: new Node()
          },
          {
            entries: [ cEntry, bEntry, aEntry ],
            label: new Node()
          }
        ], new Property( new Range( -100, 200 ) ), {
          barOptions: {
            totalRange: new Range( -100, 200 )
          }
        } );

        var screenView = new ScreenView( {
          children: [
            new HBox( {
              center: new Vector2( 512, 309 ),
              children: [
                new Node( {
                  children: [ barChartNode ]
                } ),
                new VBox( {
                  children: [
                    new HSlider( model.aProperty, new Range( -200, 300 ), {} ),
                    new HSlider( model.bProperty, new Range( -200, 300 ), {} ),
                    new HSlider( model.cProperty, new Range( -200, 300 ), {} )
                  ]
                } )
              ]
            } )
          ]
        } );

        screenView.step = function( dt ) {
          barChartNode.update();
        };

        return screenView;
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