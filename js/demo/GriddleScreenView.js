// Copyright 2014-2017, University of Colorado Boulder

/**
 * Demonstration of griddle components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var DemosScreenView = require( 'SUN/demo/DemosScreenView' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var griddle = require( 'GRIDDLE/griddle' );
  var sceneryPhetQueryParameters = require( 'SCENERY_PHET/sceneryPhetQueryParameters' );
  var Color = require( 'SCENERY/util/Color' );
  var Panel = require( 'SUN/Panel' );
  var XYDataSeries = require( 'GRIDDLE/XYDataSeries' );
  var XYPlot = require( 'GRIDDLE/XYPlot' );

  // constants - this is a hack to enable components to animate from the animation loop
  var emitter = new Emitter();

  /**
   * @constructor
   */
  function GriddleScreenView() {

    DemosScreenView.call( this, [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} getNode - creates the scene graph for the demo
       */
      { label: 'XYPlot', getNode: demoXYPlot }
    ], {
      comboBoxItemFont: new PhetFont( 12 ),
      comboBoxItemYMargin: 3,
      selectedDemoLabel: sceneryPhetQueryParameters.component
    } );
  }

  // Creates a demo for ArrowNode
  var demoXYPlot = function( layoutBounds ) {

    var time = 0;
    var plot = new XYPlot( { backgroundFill: '#efecd9' } );
    var plotPanel = new Panel( plot, {
      fill: '#efecd9',
      xMargin: 10,
      yMargin: 10,
      x: 100,
      y: 100
    } );
    var series = new XYDataSeries( { color: Color.BLUE } );
    plot.addSeries( series, false );
    var forward = true;
    var count = 0;
    emitter.addListener( function( dt ) {
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
    } );
    return plotPanel;
  };

  griddle.register( 'GriddleScreenView', GriddleScreenView );

  return inherit( DemosScreenView, GriddleScreenView, {
    step: function( dt ) {
      emitter.emit1( dt );
    }
  } );
} );