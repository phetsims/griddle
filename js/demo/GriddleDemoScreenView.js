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
  const ScrollingChartNode = require( 'GRIDDLE/ScrollingChartNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  var BarChartNode = require( 'GRIDDLE/BarChartNode' );
  var Color = require( 'SCENERY/util/Color' );
  var DemosScreenView = require( 'SUN/demo/DemosScreenView' );
  var Emitter = require( 'AXON/Emitter' );
  var griddle = require( 'GRIDDLE/griddle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var sceneryPhetQueryParameters = require( 'SCENERY_PHET/sceneryPhetQueryParameters' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var XYDataSeries = require( 'GRIDDLE/XYDataSeries' );
  var XYPlot = require( 'GRIDDLE/XYPlot' );

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
      { label: 'BarChart', getNode: demoBarChart },
      { label: 'ScrollingChartNode', getNode: demoScrollingChartNode }
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

  var demoScrollingChartNode = function( layoutBounds ) {

    var WIDTH = 200;
    var HEIGHT = 150;
    var timeProperty = new Property( 0 );
    var series1 = {
      color: 'blue',
      series: [],
      emitter: emitter
    };
    var maxSeconds = 4;
    emitter.addListener( function( dt ) {
      timeProperty.value += dt;
      series1.series.push( new Vector2( timeProperty.value, Math.sin( timeProperty.value ) ) );
      while ( series1.series[ 0 ].x < timeProperty.value - maxSeconds ) {
        series1.series.shift();
      }
    } );
    return new Panel( new ScrollingChartNode(
      new Text( 'Height (m)', { rotation: 3 * Math.PI / 2, fill: 'white' } ),
      new Text( '1 s', { fill: 'white' } ),
      timeProperty,
      WIDTH,
      HEIGHT,
      [ series1 ],
      'time (s)'
    ), {
      fill: 'gray',
      center: layoutBounds.center
    } );
  };

  griddle.register( 'GriddleDemoScreenView', GriddleDemoScreenView );

  return inherit( DemosScreenView, GriddleDemoScreenView, {
    step: function( dt ) {
      emitter.emit1( dt );
    }
  } );
} );