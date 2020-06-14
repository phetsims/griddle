// Copyright 2018-2020, University of Colorado Boulder

/**
 * A scrolling graph component.  Like a seismograph, it has pens on the right hand side that record data, and the paper
 * scrolls to the left.  It is currently sized accordingly to be used in a small draggable sensor, like the ones in Wave
 * Interference, Bending Light or Circuit Construction Kit: AC. It would typically be embedded in a Panel.
 *
 * Please see the demo in http://localhost/griddle/griddle_en.html
 *
 * Moved from wave-interference repo to griddle repo on Wed, Aug 29, 2018.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Emitter from '../../axon/js/Emitter.js';
import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import Tandem from '../../tandem/js/Tandem.js';
import DynamicSeriesNode from './DynamicSeriesNode.js';
import griddle from './griddle.js';
import GridNode from './GridNode.js';

// constants
const LABEL_GRAPH_MARGIN = 3;
const HORIZONTAL_AXIS_LABEL_MARGIN = 4;
const VERTICAL_AXIS_LABEL_MARGIN = 8;

class ScrollingChartNode extends Node {

  /**
   * @param {NumberProperty} timeProperty - indicates the passage of time in the model in the same units as the model.
   *                                      - This may be seconds or another unit depending on the model.
   * @param {DynamicSeries[]} dynamicSeriesArray - data to be plotted. The client is responsible for pruning data as
   *                                             - it leaves the visible window.
   * @param {Object} [options]
   */
  constructor( timeProperty, dynamicSeriesArray, options ) {
    super();

    options = merge( {
      width: 500,  // dimensions, in view coordinates
      height: 300, // dimensions, in view coordinates
      rightGraphMargin: 0,
      cornerRadius: 5,
      seriesLineWidth: 2,
      topMargin: 10,
      numberVerticalDashes: 12,
      rightMargin: 10,

      // {Node} - label for the vertical axis, should already be rotated if necessary
      verticalAxisLabelNode: null,

      // {Node} - label for the horizontal axis
      horizontalAxisLabelNode: null,

      // default options for the Rectangle on top (to make sure graph lines don't protrude)
      graphPanelOverlayOptions: {
        stroke: 'black',
        pickable: false
      },
      graphPanelOptions: null, // filled in below because some defaults are based on other options
      gridLineOptions: null, // filled in below because some defaults are based on other options

      showVerticalGridLabels: true,
      verticalGridLabelNumberOfDecimalPlaces: 0,

      // line spacing, in model coordinates
      majorVerticalLineSpacing: 1,
      majorHorizontalLineSpacing: 1,

      // {Range} ranges in model coordinates of plotted data
      verticalRangeProperty: new Property( new Range( -1, 1 ) ),
      horizontalRangeProperty: new Property( new Range( 0, 4 ) ),

      gridNodeOptions: null,

      initialVerticalRangeIndex: 0,

      tandem: Tandem.OPTIONAL
    }, options );

    // @private
    this.plotWidth = options.width;
    this.plotHeight = options.height;
    this.showVerticalGridLabels = options.showVerticalGridLabels;
    this.verticalGridLabelNumberOfDecimalPlaces = options.verticalGridLabelNumberOfDecimalPlaces;
    this.timeProperty = timeProperty;
    this.rightGraphMargin = options.rightGraphMargin;
    this.verticalRangeProperty = options.verticalRangeProperty;
    this.horizontalRangeProperty = options.horizontalRangeProperty;
    this.majorHorizontalLineSpacing = options.majorHorizontalLineSpacing;
    this.majorVerticalLineSpacing = options.majorVerticalLineSpacing;

    // default options to be passed into the graphPanel Rectangle
    options.graphPanelOptions = merge( {
      fill: 'white',

      // This stroke is covered by the front panel stroke, only included here to make sure the bounds align
      stroke: 'black',
      right: this.plotWidth - options.rightMargin,
      top: options.topMargin,
      pickable: false
    }, options.graphPanelOptions );

    // default options for the horizontal and vertical grid lines
    options.gridLineOptions = merge( {
      stroke: 'lightGray',
      lineWidth: 0.8
    }, options.gridLineOptions );

    // White panel with gridlines that shows the data
    options.graphPanelOptions = merge( {

      // Prevent data from being plotted outside the graph
      clipArea: Shape.roundedRectangleWithRadii( 0, 0, this.plotWidth, this.plotHeight, {
        topLeft: options.cornerRadius,
        topRight: options.cornerRadius,
        bottomLeft: options.cornerRadius,
        bottomRight: options.cornerRadius
      } )
    }, options.graphPanelOptions );
    const graphPanel = new Rectangle( 0, 0, this.plotWidth, this.plotHeight, options.cornerRadius, options.cornerRadius,
      options.graphPanelOptions
    );

    // @public {Property.<ModelViewTransform2} - Observable model-view transformation for the data, set to
    // transform the plot (zoom or pan data). Default transform puts origin at bottom left of the plot.
    this.modelViewTransformProperty = options.modelViewTransformProperty || new Property( ModelViewTransform2.createRectangleInvertedYMapping(
      new Bounds2( options.horizontalRangeProperty.get().min, this.verticalRangeProperty.get().min, options.horizontalRangeProperty.get().max, this.verticalRangeProperty.get().max ),
      new Bounds2( 0, 0, this.plotWidth - options.rightGraphMargin, this.plotHeight )
    ) );

    const gridNodeOptions = merge( {
      majorHorizontalLineSpacing: this.majorHorizontalLineSpacing,
      majorVerticalLineSpacing: this.majorVerticalLineSpacing,
      majorLineOptions: options.gridLineOptions,
      modelViewTransformProperty: this.modelViewTransformProperty
    }, options.gridNodeOptions );

    this.gridNode = new GridNode( this.plotWidth, this.plotHeight, gridNodeOptions );

    graphPanel.addChild( this.gridNode );
    this.gridLabelLayer = new Node();
    this.addChild( this.gridLabelLayer );

    const plotWidthWithMargin = this.plotWidth - options.rightGraphMargin;

    this.addChild( graphPanel );
    this.graphPanel = graphPanel;

    this.redrawLabels();

    // @private - for disposal
    this.scrollingChartNodeDisposeEmitter = new Emitter();

    dynamicSeriesArray.forEach( this.addDynamicSeries.bind( this ) );

    // Stroke on front panel is on top, so that when the curves go to the edges they do not overlap the border stroke.
    // This is a faster alternative to clipping.
    graphPanel.addChild( new Rectangle( 0, 0, this.plotWidth, this.plotHeight, options.cornerRadius, options.cornerRadius, options.graphPanelOverlayOptions ) );

    /* -------------------------------------------
     * Optional decorations
     * -------------------------------------------*/

    // Position the vertical axis title node
    if ( options.verticalAxisLabelNode ) {
      options.verticalAxisLabelNode.mutate( {
        maxHeight: graphPanel.height,
        right: this.bounds.minX - VERTICAL_AXIS_LABEL_MARGIN, // whether or not there are vertical axis labels, position to the left
        centerY: graphPanel.centerY
      } );
      this.addChild( options.verticalAxisLabelNode );
    }

    // add and position the horizontal axis label
    if ( options.horizontalAxisLabelNode ) {
      this.addChild( options.horizontalAxisLabelNode );

      // For i18n, “Time” will expand symmetrically L/R until it gets too close to the scale bar. Then, the string will
      // expand to the R only, until it reaches the point it must be scaled down in size.
      options.horizontalAxisLabelNode.maxWidth = graphPanel.right - 2 * HORIZONTAL_AXIS_LABEL_MARGIN;

      // Position the horizontal axis title node after its maxWidth is specified
      options.horizontalAxisLabelNode.mutate( {
        top: graphPanel.bottom + LABEL_GRAPH_MARGIN,
        centerX: plotWidthWithMargin / 2 + graphPanel.bounds.minX
      } );
      if ( options.horizontalAxisLabelNode.left < HORIZONTAL_AXIS_LABEL_MARGIN ) {
        options.horizontalAxisLabelNode.left = HORIZONTAL_AXIS_LABEL_MARGIN;
      }
    }

    this.mutate( options );
  }

  /**
   * Adds a DynamicSeriesNode to this ScrollingChartNode.
   * @protected
   *
   * @param {DynamicSeries} dynamicSeries
   */
  addDynamicSeries( dynamicSeries ) {
    const dynamicSeriesNode = new DynamicSeriesNode(
      dynamicSeries,
      this.plotWidth - this.rightGraphMargin,
      this.graphPanel.bounds,
      this.horizontalRangeProperty.max,
      this.timeProperty,
      this.modelViewTransformProperty
    );
    this.graphPanel.addChild( dynamicSeriesNode );
    this.scrollingChartNodeDisposeEmitter.addListener( () => dynamicSeriesNode.dispose() );
  }

  /**
   * Set line spacings for the grid and labels.
   * @public
   *
   * @param {number} majorVerticalLineSpacing
   * @param {number} majorHorizontalLineSpacing
   * @param {number} minorVerticalLineSpacing
   * @param {number} minorHorizontalLineSpacing
   */
  setLineSpacings( majorVerticalLineSpacing, majorHorizontalLineSpacing, minorVerticalLineSpacing, minorHorizontalLineSpacing ) {
    this.majorHorizontalLineSpacing = majorHorizontalLineSpacing;
    this.majorVerticalLineSpacing = majorVerticalLineSpacing;

    this.gridNode.setLineSpacings( majorVerticalLineSpacing, majorHorizontalLineSpacing, minorVerticalLineSpacing, minorHorizontalLineSpacing );
    this.redrawLabels();
  }

  /**
   * Redraws labels for when line spacing or transform changes.
   *
   * @protected
   */
  redrawLabels() {
    const gridLabelChildren = [];

    // Horizontal lines indicate increasing vertical value
    const horizontalLabelMargin = -3;

    const numberHorizontalLines = this.verticalRangeProperty.get().getLength() / this.majorHorizontalLineSpacing;
    for ( let i = 0; i <= numberHorizontalLines; i++ ) {
      const y = this.plotHeight * i / ( numberHorizontalLines );
      const yValue = this.modelViewTransformProperty.get().viewToModelY( y );
      if ( this.showVerticalGridLabels ) {
        const labelPoint = this.graphPanel.localToParentPoint( new Vector2( this.gridNode.bounds.left, y ) );

        // TODO: Should number of decimal places depend on value or perhaps on zoom level?
        // We want to show -2 -1 0 1 2, but also -0.5, 0, 0.5, right? See https://github.com/phetsims/griddle/issues/47
        gridLabelChildren.push( new Text( Utils.toFixed( yValue, this.verticalGridLabelNumberOfDecimalPlaces ), {
          fill: 'white',
          rightCenter: labelPoint.plusXY( horizontalLabelMargin, 0 )
        } ) );
      }
    }
    this.gridLabelLayer.children = gridLabelChildren;
  }

  /**
   * Releases resources when no longer used.
   * @public
   */
  dispose() {
    this.scrollingChartNodeDisposeEmitter.emit();
    this.scrollingChartNodeDisposeEmitter.dispose();
    super.dispose();
  }
}

griddle.register( 'ScrollingChartNode', ScrollingChartNode );
export default ScrollingChartNode;