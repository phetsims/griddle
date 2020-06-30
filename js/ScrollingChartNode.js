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
   * @param {NumberProperty} valueProperty - indicates the passage of horizontal value in the same units as the model.
   *                                      - This may be seconds or another unit depending on the model.
   * @param {Object} [options]
   */
  constructor( valueProperty, options ) {
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

      // {PlotStyle} - Changes how the DynamicSeries data is drawn on the chart
      plotStyle: DynamicSeriesNode.PlotStyle.LINE,

      // default options for the Rectangle on top (to make sure graph lines don't protrude)
      graphPanelOverlayOptions: {
        stroke: 'black',
        pickable: false
      },
      graphPanelOptions: null, // filled in below because some defaults are based on other options
      gridLineOptions: null, // filled in below because some defaults are based on other options

      showVerticalGridLabels: true,
      showHorizontalGridLabels: true,
      verticalGridLabelNumberOfDecimalPlaces: 0,

      // options passed to both vertical and horizontal label text
      gridLabelOptions: {},

      // line spacing, in model coordinates
      majorVerticalLineSpacing: 1,
      majorHorizontalLineSpacing: 1,

      // {Range} ranges in model coordinates of plotted data
      // TODO: The range changes with modelViewTransformProperty, lets get rid of these, see #46
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
    this.showHorizontalGridLabels = options.showHorizontalGridLabels;
    this.verticalGridLabelNumberOfDecimalPlaces = options.verticalGridLabelNumberOfDecimalPlaces;
    this.valueProperty = valueProperty;
    this.rightGraphMargin = options.rightGraphMargin;
    this.verticalRangeProperty = options.verticalRangeProperty;
    this.horizontalRangeProperty = options.horizontalRangeProperty;
    this.majorHorizontalLineSpacing = options.majorHorizontalLineSpacing;
    this.majorVerticalLineSpacing = options.majorVerticalLineSpacing;
    this.plotStyle = options.plotStyle;
    this.gridLabelOptions = options.gridLabelOptions;

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

    // @private {Node} - layers for each of the vertical and horizontal labels along grid lines
    this.verticalGridLabelLayer = new Node();
    this.horizontalGridLabelLayer = new Node();
    this.addChild( this.verticalGridLabelLayer );
    this.addChild( this.horizontalGridLabelLayer );

    const plotWidthWithMargin = this.plotWidth - options.rightGraphMargin;

    // @private - maps a DynamicSeries -> DynamicSeriesNode so that it can be potentially removed later
    this.dynamicSeriesMap = new Map();

    this.addChild( graphPanel );
    this.graphPanel = graphPanel;

    this.redrawLabels();

    const transformListener = this.redrawLabels.bind( this );
    this.modelViewTransformProperty.link( transformListener );

    // @private - for disposal
    this.scrollingChartNodeDisposeEmitter = new Emitter();

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
      const labelTop = this.showHorizontalGridLabels ? this.horizontalGridLabelLayer.bottom + LABEL_GRAPH_MARGIN : graphPanel.bottom + LABEL_GRAPH_MARGIN;
      options.horizontalAxisLabelNode.mutate( {
        top: labelTop,
        centerX: plotWidthWithMargin / 2 + graphPanel.bounds.minX
      } );
      if ( options.horizontalAxisLabelNode.left < HORIZONTAL_AXIS_LABEL_MARGIN ) {
        options.horizontalAxisLabelNode.left = HORIZONTAL_AXIS_LABEL_MARGIN;
      }
    }

    this.mutate( options );

    // @private - for dispose
    this.disposeScrollingChartNode = () => {
      this.scrollingChartNodeDisposeEmitter.emit();
      this.scrollingChartNodeDisposeEmitter.dispose();
      this.modelViewTransformProperty.unlink( transformListener );
    };
  }

  /**
   * Adds a DynamicSeriesNode to this ScrollingChartNode.
   * @public
   *
   * @param {DynamicSeries} dynamicSeries
   */
  addDynamicSeries( dynamicSeries ) {
    const dynamicSeriesNode = new DynamicSeriesNode(
      dynamicSeries,
      this.plotWidth - this.rightGraphMargin,
      new Bounds2( 0, 0,  this.plotWidth, this.plotHeight ),
      this.horizontalRangeProperty.max,
      this.valueProperty,
      this.modelViewTransformProperty
    );
    this.dynamicSeriesMap.set( dynamicSeries, dynamicSeriesNode );
    this.graphPanel.addChild( dynamicSeriesNode );
    this.scrollingChartNodeDisposeEmitter.addListener( () => dynamicSeriesNode.dispose() );
  }

  /**
   * Adds serveral DynamicSeries at once, for convenience.
   * @public
   *
   * @param {DynamicSeries[]} dynamicSeriesArray
   */
  addDynamicSeriesArray( dynamicSeriesArray ) {
    dynamicSeriesArray.forEach( this.addDynamicSeries.bind( this ) );
  }

  /**
   * Remove a DynamicSeries (and its DynamicSeriesNode)_from this plot.
   * @public
   *
   * @param {DynamicSeries} dynamicSeries
   */
  removeDynamicSeries( dynamicSeries ) {
    assert && assert( this.dynamicSeriesMap.has( dynamicSeries ), 'trying to remove DynamicSeriesNode when one does not exist.' );
    this.graphPanel.removeChild( this.dynamicSeriesMap.get( dynamicSeries ) );
    this.dynamicSeriesMap.delete( dynamicSeries );
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
    if ( this.showVerticalGridLabels ) {
      const verticalLabelChildren = [];
      const yPositions = this.gridNode.getHorizontalLinePositionsInGrid( 'majorHorizontalLineSpacing' );
      yPositions.forEach( yPosition => {
        const viewY = this.modelViewTransformProperty.get().modelToViewY( yPosition );
        const labelPoint = this.graphPanel.localToParentPoint( new Vector2( this.gridNode.bounds.left, viewY ) );

        const labelText = new Text( Utils.toFixed( yPosition, this.verticalGridLabelNumberOfDecimalPlaces ), merge( {
          rightCenter: labelPoint.plusXY( -3, 0 )
        }, this.gridLabelOptions ) );

        verticalLabelChildren.push( labelText );
      } );
      this.verticalGridLabelLayer.children = verticalLabelChildren;
    }

    if ( this.showHorizontalGridLabels ) {

      // draw labels along the horizontal lines
      const horizontalLabelChildren = [];
      const xPositions = this.gridNode.getVerticalLinePositionsInGrid( 'majorVerticalLineSpacing' );
      xPositions.forEach( xPosition => {
        const viewX = this.modelViewTransformProperty.get().modelToViewX( xPosition );
        const labelPoint = this.graphPanel.localToParentPoint( new Vector2( viewX, this.gridNode.bounds.bottom ) );

        const labelText = new Text( Utils.toFixed( xPosition, this.verticalGridLabelNumberOfDecimalPlaces ), merge( {
          centerTop: labelPoint.plusXY( 0, 3 )
        }, this.gridLabelOptions ) );

        horizontalLabelChildren.push( labelText );
      } );
      this.horizontalGridLabelLayer.children = horizontalLabelChildren;
    }
  }

  /**
   * Set the plot style for the graph, to be drawn as a line graph or a scatter plot.
   *
   * @param {XYDataSeriesNode.PlotStyle} plotStyle - one of plotStyle
   * @public
   */
  setPlotStyle( plotStyle ) {
    this.plotStyle = plotStyle;

    this.dynamicSeriesMap.forEach( dynamicSeriesNode => {
      dynamicSeriesNode.setPlotStyle( plotStyle );
    } );
  }

  /**
   * Releases resources when no longer used.
   * @public
   */
  dispose() {
    this.disposeScrollingChartNode();
    super.dispose();
  }
}

griddle.register( 'ScrollingChartNode', ScrollingChartNode );
export default ScrollingChartNode;