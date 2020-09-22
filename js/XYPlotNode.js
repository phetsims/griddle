// Copyright 2018-2020, University of Colorado Boulder

/**
 * A graph that supports "scrolling" of model data with a ModelViewTransform2 so you can display
 * different ranges of data.
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

class XYPlotNode extends Node {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    super();

    options = merge( {

      // dimensions for the plot, in view coordinates
      width: 500,
      height: 300,

      // {Property.<ModelViewTransform> - model-view transform for the data, null because default transform
      // is determined by default optional ranges defaultModelXRange and defaultModelYRange. Plot data is
      // in model coordinates and you can scale or translate the plot by modifying this Property. See
      // createRectangularModelViewTransform for typical and default chart transform.
      modelViewTransformProperty: null,

      // Default ranges in model coordinates for the model-view transform - the plot will display
      // these ranges of data within the view dimensions of width and height specified above.
      // These have no impact if you provide your own modelViewTransformProperty.
      defaultModelXRange: new Range( 0, 4 ),
      defaultModelYRange: new Range( -1, 1 ),

      // corner radius for the panel containing the plot
      cornerRadius: 5,

      // {Node} - label for the vertical axis, should already be rotated if necessary
      verticalAxisLabelNode: null,

      // {Node} - label for the horizontal axis
      horizontalAxisLabelNode: null,

      // {PlotStyle} - Changes how the DynamicSeries data is drawn on the chart
      plotStyle: DynamicSeriesNode.PlotStyle.LINE,

      // {Object|null} - Options for the Rectangle that contains chart content, including GridNode and
      // DynamicSeriesNodes.
      chartPanelOptions: null, // filled in below because some defaults are based on other options

      // {boolean} - whether or not labels indicating numeric value of major grid lines are shown
      showVerticalGridLabels: true,
      showHorizontalGridLabels: true,

      // {number} - number of decimal places for the labels along grid lines
      verticalGridLabelNumberOfDecimalPlaces: 0,
      horizontalGridLabelNumberOfDecimalPlaces: 0,

      // options passed to both vertical and horizontal label text
      gridLabelOptions: {},

      // line spacing, in model coordinates
      majorVerticalLineSpacing: 1,
      majorHorizontalLineSpacing: 1,

      // options passed to gridNode
      gridNodeOptions: {
        majorLineOptions: {
          stroke: 'lightGray',
          lineWidth: 0.8
        }
      },

      tandem: Tandem.OPTIONAL
    }, options );

    // @public (read-only)
    this.chartWidth = options.width;
    this.chartHeight = options.height;

    // @private
    this.showVerticalGridLabels = options.showVerticalGridLabels;
    this.showHorizontalGridLabels = options.showHorizontalGridLabels;
    this.verticalGridLabelNumberOfDecimalPlaces = options.verticalGridLabelNumberOfDecimalPlaces;
    this.horizontalGridLabelNumberOfDecimalPlaces = options.horizontalGridLabelNumberOfDecimalPlaces;
    this.majorHorizontalLineSpacing = options.majorHorizontalLineSpacing;
    this.majorVerticalLineSpacing = options.majorVerticalLineSpacing;
    this.plotStyle = options.plotStyle;
    this.gridLabelOptions = options.gridLabelOptions;

    // default options to be passed into the chartPanel Rectangle
    options.chartPanelOptions = merge( {
      fill: 'white',
      lineWidth: 1,

      // This stroke is covered by the front panel stroke, only included here to make sure the bounds align
      stroke: 'black',
      right: this.chartWidth,
      pickable: false
    }, options.chartPanelOptions );

    // White panel with gridlines that shows the data
    options.chartPanelOptions = merge( {

      // Prevent data from being plotted outside the graph
      clipArea: Shape.roundedRectangleWithRadii( 0, 0, this.chartWidth, this.chartHeight, {
        topLeft: options.cornerRadius,
        topRight: options.cornerRadius,
        bottomLeft: options.cornerRadius,
        bottomRight: options.cornerRadius
      } )
    }, options.chartPanelOptions );
    const chartPanel = new Rectangle( 0, 0, this.chartWidth, this.chartHeight, options.cornerRadius, options.cornerRadius,
      options.chartPanelOptions
    );

    // @public {Property.<ModelViewTransform2} - Observable model-view transformation for the data, set to
    // transform the plot (zoom or pan data). Default transform puts origin at bottom left of the plot with
    // x ranging from 0-4 and y ranging from -1 to 1
    this.modelViewTransformProperty = options.modelViewTransformProperty || new Property( this.createRectangularModelViewTransform( options.defaultModelXRange, options.defaultModelYRange ) );

    const gridNodeOptions = merge( {
      majorHorizontalLineSpacing: this.majorHorizontalLineSpacing,
      majorVerticalLineSpacing: this.majorVerticalLineSpacing,
      modelViewTransformProperty: this.modelViewTransformProperty
    }, options.gridNodeOptions );

    this.gridNode = new GridNode( this.chartWidth, this.chartHeight, gridNodeOptions );

    chartPanel.addChild( this.gridNode );

    // @private {Node} - layers for each of the vertical and horizontal labels along grid lines
    this.verticalGridLabelLayer = new Node();
    this.horizontalGridLabelLayer = new Node();
    this.addChild( this.verticalGridLabelLayer );
    this.addChild( this.horizontalGridLabelLayer );

    const chartWidthWithMargin = this.chartWidth;

    // @private Map.<DynamicSeries,DynamicSeriesNode> maps a series the Node that displays it
    this.dynamicSeriesMap = new Map();

    this.addChild( chartPanel );

    // @public for adding addition components and doing relative layout
    this.chartPanel = chartPanel;

    this.redrawLabels();

    /**
     * Redraw the horizontal and vertical labels if the transform changes in such a way
     * that each set of labels needs to be redrawn.
     *
     * @param {Transform3} transform
     * @param {Transform3} oldTransform
     */
    const transformListener = ( transform, oldTransform ) => {
      const differenceMatrix = transform.matrix.minus( oldTransform.matrix );

      const scaleVector = differenceMatrix.scaleVector;
      const translationVector = differenceMatrix.translation;

      const horizontalDirty = scaleVector.x !== 0 || translationVector.x !== 0;
      const verticalDirty = scaleVector.y !== 0 || translationVector.y !== 0;

      if ( verticalDirty ) {
        this.redrawVerticalLabels();
      }
      if ( horizontalDirty ) {
        this.redrawHorizontalLabels();
      }
    };

    // linked lazily because listener needs old transform to determine changes
    this.modelViewTransformProperty.lazyLink( transformListener );

    // @private - for disposal
    this.scrollingChartNodeDisposeEmitter = new Emitter();

    // Stroke on front panel is on top, so that when the curves go to the edges they do not overlap the border stroke,
    // and so the GridNode appears below the panel stroke as well.
    chartPanel.addChild( new Rectangle( 0, 0, this.chartWidth, this.chartHeight, options.cornerRadius, options.cornerRadius, {
      stroke: chartPanel.stroke,
      lineWidth: chartPanel.lineWidth,
      pickable: false
    } ) );

    /* -------------------------------------------
     * Optional decorations
     * -------------------------------------------*/

    // Position the vertical axis title node
    if ( options.verticalAxisLabelNode ) {
      options.verticalAxisLabelNode.mutate( {
        maxHeight: chartPanel.height,
        right: this.bounds.minX - VERTICAL_AXIS_LABEL_MARGIN, // whether or not there are vertical axis labels, position to the left
        centerY: chartPanel.centerY
      } );
      this.addChild( options.verticalAxisLabelNode );
    }

    // add and position the horizontal axis label
    if ( options.horizontalAxisLabelNode ) {
      this.addChild( options.horizontalAxisLabelNode );

      // For i18n, “Time” will expand symmetrically L/R until it gets too close to the scale bar. Then, the string will
      // expand to the R only, until it reaches the point it must be scaled down in size.
      options.horizontalAxisLabelNode.maxWidth = chartPanel.right - 2 * HORIZONTAL_AXIS_LABEL_MARGIN;

      // Position the horizontal axis title node after its maxWidth is specified
      const labelTop = this.showHorizontalGridLabels ? this.horizontalGridLabelLayer.bottom + LABEL_GRAPH_MARGIN : chartPanel.bottom + LABEL_GRAPH_MARGIN;
      options.horizontalAxisLabelNode.mutate( {
        top: labelTop,
        centerX: chartWidthWithMargin / 2 + chartPanel.bounds.minX
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
   * @public
   * @param {number} verticalGridLabelNumberOfDecimalPlaces
   */
  setVerticalGridLabelNumberOfDecimalPlaces( verticalGridLabelNumberOfDecimalPlaces ) {
    this.verticalGridLabelNumberOfDecimalPlaces = verticalGridLabelNumberOfDecimalPlaces;
    this.redrawVerticalLabels();
  }

  /**
   * @public
   * @param {number} horizontalGridLabelNumberOfDecimalPlaces
   */
  setHorizontalGridLabelNumberOfDecimalPlaces( horizontalGridLabelNumberOfDecimalPlaces ) {
    this.horizontalGridLabelNumberOfDecimalPlaces = horizontalGridLabelNumberOfDecimalPlaces;
    this.redrawHorizontalLabels();
  }

  /**
   * Adds a DynamicSeriesNode to this XYPlotNode.
   * @public
   *
   * @param {DynamicSeries} dynamicSeries
   */
  addDynamicSeries( dynamicSeries ) {
    const dynamicSeriesNode = new DynamicSeriesNode(
      dynamicSeries,
      this.chartWidth,
      new Bounds2( 0, 0, this.chartWidth, this.chartHeight ),
      this.modelViewTransformProperty
    );
    this.dynamicSeriesMap.set( dynamicSeries, dynamicSeriesNode );
    this.chartPanel.addChild( dynamicSeriesNode );
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
    this.chartPanel.removeChild( this.dynamicSeriesMap.get( dynamicSeries ) );
    this.dynamicSeriesMap.delete( dynamicSeries );
  }

  /**
   * Set line spacings for the grid and labels.
   * @public
   *
   * @param {Object} config
   */
  setLineSpacings( config ) {

    config = merge( {

      // @param {number|null} - at least one spacing is required and values must
      // conform to requirements of line spacings in GridNode
      majorVerticalLineSpacing: null,
      majorHorizontalLineSpacing: null,
      minorVerticalLineSpacing: null,
      minorHorizontalLineSpacing: null
    }, config );

    this.majorHorizontalLineSpacing = config.majorHorizontalLineSpacing;
    this.majorVerticalLineSpacing = config.majorVerticalLineSpacing;

    this.gridNode.setLineSpacings( config );
    this.redrawLabels();
  }

  /**
   * Set the precision for determining location of lines for GridNode. Precision is not limited if value is null.
   * GridNode calculates placement of lines based on spacings and model view transform, but this is susceptible
   * to IEEE floating point precision errors, ocassionally resulting in lost lines.
   * @public
   *
   * @param {null|number} precision
   */
  setGridLinePrecision( precision ) {
    this.gridNode.setGridLinePrecision( precision );
  }

  /**
   * Redraw labels along the vertical lines.
   * @protected
   */
  redrawVerticalLabels() {
    if ( this.showVerticalGridLabels ) {
      const verticalLabelChildren = [];
      const yPositions = this.gridNode.getLinePositionsInGrid( this.majorHorizontalLineSpacing, GridNode.LineType.MAJOR_HORIZONTAL );
      yPositions.forEach( yPosition => {
        const viewY = this.modelViewTransformProperty.get().modelToViewY( yPosition );
        const labelPoint = this.chartPanel.localToParentPoint( new Vector2( this.gridNode.bounds.left, viewY ) );

        const labelText = new Text( Utils.toFixed( yPosition, this.verticalGridLabelNumberOfDecimalPlaces ), merge( {
          rightCenter: labelPoint.plusXY( -3, 0 )
        }, this.gridLabelOptions ) );

        verticalLabelChildren.push( labelText );
      } );
      this.verticalGridLabelLayer.children = verticalLabelChildren;
    }
  }

  /**
   * Redraw labels along the horizontal grid lines.
   * @protected
   */
  redrawHorizontalLabels() {
    if ( this.showHorizontalGridLabels ) {

      // draw labels along the horizontal lines
      const horizontalLabelChildren = [];
      const xPositions = this.gridNode.getLinePositionsInGrid( this.majorVerticalLineSpacing, GridNode.LineType.MAJOR_VERTICAL );
      xPositions.forEach( xPosition => {
        const viewX = this.modelViewTransformProperty.get().modelToViewX( xPosition );
        const labelPoint = this.chartPanel.localToParentPoint( new Vector2( viewX, this.gridNode.bounds.bottom ) );

        const labelText = new Text( Utils.toFixed( xPosition, this.horizontalGridLabelNumberOfDecimalPlaces ), merge( {
          centerTop: labelPoint.plusXY( 0, 3 )
        }, this.gridLabelOptions ) );

        horizontalLabelChildren.push( labelText );
      } );
      this.horizontalGridLabelLayer.children = horizontalLabelChildren;
    }
  }

  /**
   * Redraws labels for when line spacing or transform changes. Labels are only drawn along the major
   * grid lines.
   *
   * @protected
   */
  redrawLabels() {
    this.redrawVerticalLabels();
    this.redrawHorizontalLabels();
  }

  /**
   * Set the plot style for the graph, to be drawn as a line graph or a scatter plot.
   *
   * @param {DynamicSeriesNode.PlotStyle} plotStyle - one of plotStyle
   * @public
   */
  setPlotStyle( plotStyle ) {
    this.plotStyle = plotStyle;

    this.dynamicSeriesMap.forEach( dynamicSeriesNode => {
      dynamicSeriesNode.setPlotStyle( plotStyle );
    } );
  }

  /**
   * Create a typical ModelViewTransform2 for the plot that spans the widthRange and heightRange in model coordinates
   * so that those ranges are contained within and fill the XYPlotNode view bounds. Also inverts y so that
   * +y points up on the chart. Other transformms may be used, but this is the most common.
   * @public
   *
   * @param {Range} widthRange - in model coordinates
   * @param {Range} heightRange - in model coordinates
   * @returns {ModelViewTransform2}
   */
  createRectangularModelViewTransform( widthRange, heightRange ) {
    return ModelViewTransform2.createRectangleInvertedYMapping(
      new Bounds2( widthRange.min, heightRange.min, widthRange.max, heightRange.max ),
      new Bounds2( 0, 0, this.chartWidth, this.chartHeight )
    );
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

griddle.register( 'XYPlotNode', XYPlotNode );
export default XYPlotNode;