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
  var Dimension2 = require( 'DOT/Dimension2' );
  var DemosScreenView = require( 'SUN/demo/DemosScreenView' );
  var Emitter = require( 'AXON/Emitter' );
  var griddle = require( 'GRIDDLE/griddle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var sceneryPhetQueryParameters = require( 'SCENERY_PHET/sceneryPhetQueryParameters' );
  var Vector2 = require( 'DOT/Vector2' );
  var VSlider = require( 'SUN/VSlider' );
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
       * {function(Bounds2): Node} createNode - creates the scene graph for the demo
       */
      { label: 'XYPlot', createNode: demoXYPlot },
      { label: 'BarChart', createNode: demoBarChart },
      { label: 'ScrollingChartNode', createNode: demoScrollingChartNode }
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
    const listener = function( dt ) {
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
    emitter.addListener( listener );

    // Swap out the dispose function for one that also removes the Emitter listener
    var plotPanelDispose = plotPanel.dispose.bind( plotPanel );
    plotPanel.dispose = function() {
      emitter.removeListener( listener );
      plotPanelDispose();
    };
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
    const listener = function( dt ) {
      barChartNode.update();
    };
    emitter.addListener( listener );
    const sliderRange = new Range( -200, 300 );
    const sliderOptions = {
      trackSize: new Dimension2( 200, 5 )
    };
    const hBox = new HBox( {
      align: 'top',
      spacing: 60,
      center: new Vector2( 512, 309 ),
      children: [
        new Node( {
          children: [ barChartNode ]
        } ),
        new HBox( {
          spacing: 25,
          children: [
            new VSlider( model.aProperty, sliderRange, _.extend( {}, sliderOptions, { trackFillEnabled: aEntry.color } ) ),
            new VSlider( model.bProperty, sliderRange, _.extend( {}, sliderOptions, { trackFillEnabled: bEntry.color } ) ),
            new VSlider( model.cProperty, sliderRange, _.extend( {}, sliderOptions, { trackFillEnabled: cEntry.color } ) )
          ]
        } )
      ]
    } );

    // Swap out the dispose function for one that also removes the Emitter listener
    var hboxDispose = hBox.dispose.bind( hBox );
    hBox.dispose = function() {
      emitter.removeListener( listener );
      hboxDispose();
    };
    return hBox;
  };

  var demoScrollingChartNode = function( layoutBounds ) {

    var WIDTH = 200;
    var HEIGHT = 150;
    var timeProperty = new Property( 0 );
    var series1 = {
      color: 'blue',
      data: [],
      emitter: emitter
    };
    var maxSeconds = 4;
    const listener = function( dt ) {
      timeProperty.value += dt;
      series1.data.push( new Vector2( timeProperty.value, Math.sin( timeProperty.value ) ) );
      while ( series1.data[ 0 ].x < timeProperty.value - maxSeconds ) {
        series1.data.shift();
      }
    };
    emitter.addListener( listener );
    const panel = new Panel( new ScrollingChartNode(
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

    // Swap out the dispose function for one that also removes the Emitter listener
    var panelDispose = panel.dispose.bind( panel );
    panel.dispose = function() {
      emitter.removeListener( listener );
      panelDispose();
    };
    return panel;
  };

  griddle.register( 'GriddleDemoScreenView', GriddleDemoScreenView );

  return inherit( DemosScreenView, GriddleDemoScreenView, {
    step: function( dt ) {
      emitter.emit1( dt );
    }
  } );
} );