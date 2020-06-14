// Copyright 2018-2020, University of Colorado Boulder

/**
 * Demonstration of griddle components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import sceneryPhetQueryParameters from '../../../scenery-phet/js/sceneryPhetQueryParameters.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Color from '../../../scenery/js/util/Color.js';
import BooleanRectangularStickyToggleButton from '../../../sun/js/buttons/BooleanRectangularStickyToggleButton.js';
import BooleanRectangularToggleButton from '../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import DemosScreenView from '../../../sun/js/demo/DemosScreenView.js';
import NumberSpinner from '../../../sun/js/NumberSpinner.js';
import Panel from '../../../sun/js/Panel.js';
import VSlider from '../../../sun/js/VSlider.js';
import BarChartNode from '../BarChartNode.js';
import DynamicSeries from '../DynamicSeries.js';
import griddle from '../griddle.js';
import GridNode from '../GridNode.js';
import ScrollingChartNode from '../ScrollingChartNode.js';
import SeismographNode from '../SeismographNode.js';
import XYPlotNode from '../XYPlotNode.js';

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
      { label: 'XYPlotNode', createNode: demoXYPlotNode },
      { label: 'GridNode', createNode: demoGridNode },
      { label: 'BarChart', createNode: demoBarChart },
      { label: 'ScrollingChartNode', createNode: demoScrollingChartNode },
      { label: 'SeismographNode', createNode: demoSeismographNode }
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

// Creates a demo for the XYPlotNode
const demoXYPlotNode = function( layoutBounds ) {

  let time = 0;
  const plot = new XYPlotNode( { backgroundFill: '#efecd9' } );
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

// Creates a demo for GridNode
const demoGridNode = layoutBounds => {
  const gridWidth = 400;
  const gridHeight = 400;
  const minorSpacingRange = new Range( 1, 2 );
  const majorSpacingRange = new Range( 4, 10 );
  const defaultMinorSpacing = minorSpacingRange.min;
  const defaultMajorSpacing = majorSpacingRange.min;
  const modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleMapping(
    new Bounds2( 0, 0, 10, 10 ),
    new Bounds2( 0, 0, gridWidth, gridHeight )
  ) );

  const gridNode = new GridNode( gridWidth, gridHeight, {
    majorHorizontalLineSpacing: defaultMajorSpacing,
    majorVerticalLineSpacing: defaultMajorSpacing,
    minorHorizontalLineSpacing: defaultMinorSpacing,
    minorVerticalLineSpacing: defaultMinorSpacing,
    modelViewTransformProperty: modelViewTransformProperty
  } );

  // creates a NumberSpinner with a text label that controls grid spacing
  const createLabelledSpinner = ( labelString, numberProperty, enabledProperty, valueDelta ) => {
    const label = new Text( labelString, { font: new PhetFont( 15 ) } );
    const spinner = new NumberSpinner( numberProperty, new Property( numberProperty.range ), {
      deltaValue: valueDelta,
      enabledProperty: enabledProperty
    } );
    return new HBox( {
      children: [ label, spinner ],
      spacing: 5
    } );
  };

  // creates a BooleanRectangularToggleButton that toggles visibility of grid lines
  const createToggleLinesButton = ( visibleProperty, visibleText, hiddenText ) => {
    return new BooleanRectangularToggleButton( new Text( visibleText ), new Text( hiddenText ), visibleProperty );
  };

  // Properties for controls to change the GridNode
  const verticalLinesVisibleProperty = new BooleanProperty( true );
  const horizontalLinesVisibleProperty = new BooleanProperty( true );
  const scrollingProperty = new BooleanProperty( false );

  const minorHorizontalLineSpacingProperty = new NumberProperty( defaultMinorSpacing, { range: minorSpacingRange } );
  const minorVerticalLineSpacingProperty = new NumberProperty( defaultMinorSpacing, { range: minorSpacingRange } );
  const majorHorizontalLineSpacingProperty = new NumberProperty( defaultMajorSpacing, { range: majorSpacingRange } );
  const majorVerticalLineSpacingProperty = new NumberProperty( defaultMajorSpacing, { range: majorSpacingRange } );

  // controls to change the GridNode
  const minorHorizontalLineSpinner = createLabelledSpinner( 'Minor Horizontal Spacing', minorHorizontalLineSpacingProperty, horizontalLinesVisibleProperty, 1 );
  const minorVerticalLineSpinner = createLabelledSpinner( 'Minor Vertical Spacing', minorVerticalLineSpacingProperty, verticalLinesVisibleProperty, 1 );
  const majorHorizontalLineSpinner = createLabelledSpinner( 'Major Horizontal Spacing', majorHorizontalLineSpacingProperty, horizontalLinesVisibleProperty, 2 );
  const majorVerticalLineSpinner = createLabelledSpinner( 'Major Vertical Spacing', majorVerticalLineSpacingProperty, verticalLinesVisibleProperty, 2 );

  const hideHorizontalLinesButton = createToggleLinesButton( horizontalLinesVisibleProperty, 'Hide Horizontal', 'Show Horizontal' );
  const hideVerticalLinesButton = createToggleLinesButton( verticalLinesVisibleProperty, 'Hide Vertical', 'Show Horizontal' );

  const hideButtonsHBox = new HBox( {
    children: [ hideHorizontalLinesButton, hideVerticalLinesButton ],
    spacing: 10
  } );

  const scrollButton = new BooleanRectangularStickyToggleButton( scrollingProperty, {
    content: new Text( 'Scroll' )
  } );

  const controls = new VBox( {
    children: [ minorHorizontalLineSpinner, minorVerticalLineSpinner, majorHorizontalLineSpinner, majorVerticalLineSpinner, hideButtonsHBox, scrollButton ],
    spacing: 15,
    align: 'right'
  } );

  const node = new HBox( {
    children: [ controls, gridNode ],
    spacing: 15,
    center: layoutBounds.center,
    resize: false
  } );

  Property.multilink( [ verticalLinesVisibleProperty, horizontalLinesVisibleProperty ], ( verticalVisible, horizontalVisible ) => {
    const majorVerticalLineSpacing = verticalVisible ? majorVerticalLineSpacingProperty.get() : null;
    const minorVerticalLineSpacing = verticalVisible ? minorVerticalLineSpacingProperty.get() : null;
    const majorHorizontalLineSpacing = horizontalVisible ? majorHorizontalLineSpacingProperty.get() : null;
    const minorHorizontalLineSpacing = horizontalVisible ? minorHorizontalLineSpacingProperty.get() : null;

    gridNode.setLineSpacings( majorVerticalLineSpacing, majorHorizontalLineSpacing, minorVerticalLineSpacing, minorHorizontalLineSpacing );

    // disable the other button, cant have both sets hidden at once
    hideHorizontalLinesButton.enabled = verticalVisible;
    hideVerticalLinesButton.enabled = horizontalVisible;
  } );

  Property.multilink( [ majorVerticalLineSpacingProperty, majorHorizontalLineSpacingProperty, minorHorizontalLineSpacingProperty, minorVerticalLineSpacingProperty ],
    gridNode.setLineSpacings.bind( gridNode )
  );

  let offset = 0;
  emitter.addListener( dt => {
    if ( scrollingProperty.get() ) {
      offset -= dt;
      const offsetVector = new Vector2( offset, offset );

      modelViewTransformProperty.set( ModelViewTransform2.createRectangleMapping(
        new Bounds2( offsetVector.x, offsetVector.y, 10 + offsetVector.x, 10 + offsetVector.y ),
        new Bounds2( 0, 0, gridWidth, gridHeight )
      ) );
    }
  } );

  return node;
};

/**
 * Creates an example ScrollingChartNode
 * @param layoutBounds
 */
const demoScrollingChartNode = function( layoutBounds ) {
  const timeProperty = new Property( 0 );
  const series1 = new DynamicSeries( { color: 'blue' } );
  const series2 = new DynamicSeries( { color: 'orange' } );
  const maxTime = 4;
  const horizontalRange = new Range( 0, maxTime );
  const verticalRange = new Range( -1, 1 );
  const plotWidth = 600;
  const plotHeight = 300;

  const modelViewTransformProperty = new Property( ModelViewTransform2.createRectangleInvertedYMapping(
    new Bounds2( horizontalRange.min, verticalRange.min, horizontalRange.max, verticalRange.max ),
    new Bounds2( 0, 0, plotWidth, plotHeight )
  ) );

  const listener = dt => {

    // Increment the model time
    timeProperty.value += dt;

    // Sample new data
    series1.addXYDataPoint( timeProperty.value, Math.sin( timeProperty.value ) );
    series2.addXYDataPoint( timeProperty.value, Math.sin( timeProperty.value + 0.5 ) );

    // time has gone beyond the initial max time, so update the transform to pan data so that the new points
    // are in view
    if ( timeProperty.get() > maxTime ) {
      modelViewTransformProperty.set( ModelViewTransform2.createRectangleInvertedYMapping(
        new Bounds2( timeProperty.get() - maxTime, verticalRange.min, timeProperty.get(), verticalRange.max ),
        new Bounds2( 0, 0, plotWidth, plotHeight )
      ) );
    }

    // Data that does not fall within the displayed window should be removed.
    while ( series1.getDataPoint( 0 ).x < timeProperty.value - maxTime ) {
      series1.shiftData();
      series2.shiftData();
    }
  };
  emitter.addListener( listener );
  const scrollingChartNode = new ScrollingChartNode( timeProperty, [ series1, series2 ], {
    width: 600,
    height: 300,
    verticalAxisLabelNode: new Text( 'Height (m)', { fill: 'white', rotation: 3 * Math.PI / 2 } ),
    horizontalAxisLabelNode: new Text( 'time (s)', { fill: 'white' } ),
    modelViewTransformProperty: modelViewTransformProperty
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

const demoSeismographNode = layoutBounds => {
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
  const seismographNode = new SeismographNode( timeProperty, [ series1 ], new Text( '1 s', { fill: 'white' } ), {
    width: 200,
    height: 150,
    verticalAxisLabelNode: new Text( 'Height (m)', {
      rotation: 3 * Math.PI / 2,
      fill: 'white'
    } ),
    horizontalAxisLabelNode: new Text( 'time (s)', { fill: 'white' } ),
    verticalRanges: [ new Range( -1, 1 ), new Range( -2, 2 ), new Range( -3, 3 ) ]
  } );
  const panel = new Panel( seismographNode, {
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