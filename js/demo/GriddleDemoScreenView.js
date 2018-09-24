// Copyright 2014-2017, University of Colorado Boulder

/**
 * Demonstration of griddle components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const LabeledScrollingChartNode = require( 'GRIDDLE/LabeledScrollingChartNode' );
  const ScrollingChartNode = require( 'GRIDDLE/ScrollingChartNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const BarChartNode = require( 'GRIDDLE/BarChartNode' );
  const Color = require( 'SCENERY/util/Color' );
  const DemosScreenView = require( 'SUN/demo/DemosScreenView' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Emitter = require( 'AXON/Emitter' );
  const griddle = require( 'GRIDDLE/griddle' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const sceneryPhetQueryParameters = require( 'SCENERY_PHET/sceneryPhetQueryParameters' );
  const Vector2 = require( 'DOT/Vector2' );
  const VSlider = require( 'SUN/VSlider' );
  const XYDataSeries = require( 'GRIDDLE/XYDataSeries' );
  const XYPlot = require( 'GRIDDLE/XYPlot' );

  // constants - this is a hack to enable components to animate from the animation loop
  const emitter = new Emitter();

  class GriddleDemoScreenView extends DemosScreenView {
    constructor() {

      super( [

        /**
         * To add a demo, add an object literal here. Each object has these properties:
         *
         * {string} label - label in the combo box
         * {function(Bounds2): Node} createNode - creates the scene graph for the demo
         */
        { label: 'XYPlot', createNode: demoXYPlot },
        { label: 'BarChart', createNode: demoBarChart },
        { label: 'LabeledScrollingChartNode', createNode: demoLabeledScrollingChartNode }
      ], {
        comboBoxItemFont: new PhetFont( 12 ),
        comboBoxItemYMargin: 3,
        selectedDemoLabel: sceneryPhetQueryParameters.component
      } );
    }

    /**
     * Move the model forward in time.
     * @param {number} dt - elapsed time in seconds
     * @public
     */
    step( dt ) {
      emitter.emit1( dt );
    }
  }

  // Creates a demo for the XYPlot
  const demoXYPlot = function( layoutBounds ) {

    let time = 0;
    const plot = new XYPlot( { backgroundFill: '#efecd9' } );
    const plotPanel = new Panel( plot, {
      fill: '#efecd9',
      xMargin: 10,
      yMargin: 10,
      x: 100,
      y: 100
    } );
    const series = new XYDataSeries( { color: Color.BLUE } );
    plot.addSeries( series, false );
    let forward = true;
    let count = 0;
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
    const plotPanelDispose = plotPanel.dispose.bind( plotPanel );
    plotPanel.dispose = function() {
      emitter.removeListener( listener );
      plotPanelDispose();
    };
    return plotPanel;
  };

  // Creates a demo for the BarChartNode
  const demoBarChart = function( layoutBounds ) {
    const model = {
      aProperty: new Property( 0 ),
      bProperty: new Property( 0 ),
      cProperty: new Property( 0 )
    };
    const aEntry = {
      property: model.aProperty,
      color: 'red'
    };
    const bEntry = {
      property: model.bProperty,
      color: 'green'
    };
    const cEntry = {
      property: model.cProperty,
      color: 'blue'
    };

    const barChartNode = new BarChartNode( [
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
    const hboxDispose = hBox.dispose.bind( hBox );
    hBox.dispose = function() {
      emitter.removeListener( listener );
      hboxDispose();
    };
    return hBox;
  };

  /**
   * Creates an example LabeledScrollingChartNode
   * @param layoutBounds
   */
  const demoLabeledScrollingChartNode = function( layoutBounds ) {
    const timeProperty = new Property( 0 );
    const series1 = {
      color: 'blue',
      data: [],
      emitter: emitter
    };
    const maxSeconds = 4;
    const listener = dt => {

      // Increment the model time
      timeProperty.value += dt;

      // Sample new data
      series1.data.push( new Vector2( timeProperty.value, Math.sin( timeProperty.value ) ) );

      // Data that does not fall within the displayed window should be removed.
      while ( series1.data[ 0 ].x < timeProperty.value - maxSeconds ) {
        series1.data.shift();
      }
    };
    emitter.addListener( listener );
    const scrollingChartNode = new ScrollingChartNode( timeProperty, [ series1 ], {
      width: 200,
      height: 150
    } );
    const panel = new Panel( new LabeledScrollingChartNode(
      scrollingChartNode,
      new Text( 'Height (m)', { rotation: 3 * Math.PI / 2, fill: 'white' } ),
      new Text( '1 s', { fill: 'white' } ),
      'time (s)'
    ), {
      fill: 'gray',
      center: layoutBounds.center
    } );

    // Swap out the dispose function for one that also removes the Emitter listener
    const panelDispose = panel.dispose.bind( panel );
    panel.dispose = () => {
      emitter.removeListener( listener );
      panelDispose();
    };
    return panel;
  };

  return griddle.register( 'GriddleDemoScreenView', GriddleDemoScreenView );
} );