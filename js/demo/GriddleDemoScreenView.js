// Copyright 2018-2020, University of Colorado Boulder

/**
 * Demonstration of griddle components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../../axon/js/Emitter.js';
import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import sceneryPhetQueryParameters from '../../../scenery-phet/js/sceneryPhetQueryParameters.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Color from '../../../scenery/js/util/Color.js';
import DemosScreenView from '../../../sun/js/demo/DemosScreenView.js';
import Panel from '../../../sun/js/Panel.js';
import VSlider from '../../../sun/js/VSlider.js';
import BarChartNode from '../BarChartNode.js';
import DynamicSeries from '../DynamicSeries.js';
import griddle from '../griddle.js';
import ScrollingChartNode from '../ScrollingChartNode.js';
import XYPlot from '../XYPlot.js';

// constants - this is a hack to enable components to animate from the animation loop
const emitter = new Emitter( { parameters: [ { valueType: 'number' } ] } );

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
      { label: 'ScrollingChartNode', createNode: demoScrollingChartNode }
    ], {
      selectedDemoLabel: sceneryPhetQueryParameters.component
    } );
  }

  /**
   * Move the model forward in time.
   * @param {number} dt - elapsed time in seconds
   * @public
   */
  step( dt ) {
    emitter.emit( dt );
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
    center: layoutBounds.center
  } );
  const series = new DynamicSeries( { color: Color.BLUE } );
  plot.addSeries( series, false );
  let forward = true;
  let count = 0;
  const listener = function( dt ) {
    series.addXYDataPoint( time, -Math.abs( -Math.sin( time / 100 + count ) * 400 * 0.8 ) );
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
    trackSize: new Dimension2( 5, 200 )
  };
  const hBox = new HBox( {
    align: 'top',
    spacing: 60,
    center: layoutBounds.center,
    children: [
      new Node( {
        children: [ barChartNode ]
      } ),
      new HBox( {
        spacing: 25,
        children: [
          new VSlider( model.aProperty, sliderRange, merge( {}, sliderOptions, { trackFillEnabled: aEntry.color } ) ),
          new VSlider( model.bProperty, sliderRange, merge( {}, sliderOptions, { trackFillEnabled: bEntry.color } ) ),
          new VSlider( model.cProperty, sliderRange, merge( {}, sliderOptions, { trackFillEnabled: cEntry.color } ) )
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
 * Creates an example ScrollingChartNode
 * @param layoutBounds
 */
const demoScrollingChartNode = function( layoutBounds ) {
  const timeProperty = new Property( 0 );
  const series1 = new DynamicSeries( { color: 'blue' } );
  const maxTime = 4;
  const listener = dt => {

    // Increment the model time
    timeProperty.value += dt;

    // Sample new data
    series1.addXYDataPoint( timeProperty.value, Math.sin( timeProperty.value ) );

    // Data that does not fall within the displayed window should be removed.
    while ( series1.getDataPoint( 0 ).x < timeProperty.value - maxTime ) {
      series1.shiftData();
    }
  };
  emitter.addListener( listener );
  const scrollingChartNode = new ScrollingChartNode( timeProperty, [ series1 ], new Text( 'Height (m)', {
      rotation: 3 * Math.PI / 2,
      fill: 'white'
    } ),
    new Text( 'time (s)', { fill: 'white' } ),
    new Text( '1 s', { fill: 'white' } ), {
      width: 200,
      height: 150
    } );
  const panel = new Panel( scrollingChartNode, {
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

griddle.register( 'GriddleDemoScreenView', GriddleDemoScreenView );
export default GriddleDemoScreenView;