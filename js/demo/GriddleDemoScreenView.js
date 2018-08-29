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
  var Color = require( 'SCENERY/util/Color' );
  var DemosScreenView = require( 'SUN/demo/DemosScreenView' );
  var Emitter = require( 'AXON/Emitter' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var sceneryPhetQueryParameters = require( 'SCENERY_PHET/sceneryPhetQueryParameters' );
  var XYDataSeries = require( 'GRIDDLE/XYDataSeries' );
  var XYPlot = require( 'GRIDDLE/XYPlot' );
  var BarChartNode = require( 'GRIDDLE/BarChartNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Range = require( 'DOT/Range' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants - this is a hack to enable components to animate from the animation loop
  var emitter = new Emitter();

  /**
   * @constructor
   */
  function GriddleDemoScreenView() {

    DemosScreenView.call( this, [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} getNode - creates the scene graph for the demo
       */
      { label: 'XYPlot', getNode: demoXYPlot },
      { label: 'BarChart', getNode: demoBarChart }
    ], {
      comboBoxItemFont: new PhetFont( 12 ),
      comboBoxItemYMargin: 3,
      selectedDemoLabel: sceneryPhetQueryParameters.component
    } );
  }

  // Creates a demo for the XYPlot
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

  // Creates a demo for the BarChartNode
  var demoBarChart = function( layoutBounds ) {
    var model = {
      aProperty: new Property( 0 ),
      bProperty: new Property( 0 ),
      cProperty: new Property( 0 )
    };
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
      { entries: [ aEntry ], label: new Node() },
      { entries: [ bEntry ], label: new Node() },
      { entries: [ cEntry ], label: new Node() },
      { entries: [ cEntry, bEntry, aEntry ], label: new Node() }
    ], new Property( new Range( -100, 200 ) ), {
      barOptions: {
        totalRange: new Range( -100, 200 )
      }
    } );
    emitter.addListener( function( dt ) {
      barChartNode.update();
    } );
    const sliderRange = new Range( -200, 300 );
    return new HBox( {
      center: new Vector2( 512, 309 ),
      children: [
        new Node( {
          children: [ barChartNode ]
        } ),
        new VBox( {
          children: [
            new HSlider( model.aProperty, sliderRange ),
            new HSlider( model.bProperty, sliderRange ),
            new HSlider( model.cProperty, sliderRange )
          ]
        } )
      ]
    } );
  };


  griddle.register( 'GriddleDemoScreenView', GriddleDemoScreenView );

  return inherit( DemosScreenView, GriddleDemoScreenView, {
    step: function( dt ) {
      emitter.emit1( dt );
    }
  } );
} );