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
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Range from '../../dot/js/Range.js';
import Utils from '../../dot/js/Utils.js';
import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import ZoomButton from '../../scenery-phet/js/buttons/ZoomButton.js';
import Line from '../../scenery/js/nodes/Line.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import Tandem from '../../tandem/js/Tandem.js';
import DynamicSeriesNode from './DynamicSeriesNode.js';
import griddle from './griddle.js';
import SpanNode from './SpanNode.js';

// constants
const LABEL_GRAPH_MARGIN = 3;
const HORIZONTAL_AXIS_LABEL_MARGIN = 4;
const VERTICAL_AXIS_LABEL_MARGIN = 4;

class ScrollingChartNode extends Node {

  /**
   * @param {NumberProperty} timeProperty - indicates the passage of time in the model in the same units as the model.
   *                                      - This may be seconds or another unit depending on the model.
   * @param {DynamicSeries[]} dynamicSeriesArray - data to be plotted. The client is responsible for pruning data as
   *                                             - it leaves the visible window.
   * @param {Node} verticalAxisLabelNode - shown on the vertical axis (should already be rotated, if necessary)
   * @param {Node} horizontalAxisLabelNode - shown on the horizontal axis
   * @param {Node} spanLabelNode - shown for the time divisions
   * @param {Object} [options]
   */
  constructor( timeProperty, dynamicSeriesArray, verticalAxisLabelNode, horizontalAxisLabelNode, spanLabelNode, options ) {
    super();

    options = merge( {
      width: 190,  // dimensions
      height: 140, // dimensions
      numberHorizontalLines: 3, // Number of horizontal lines (not counting top and bottom)
      numberVerticalLines: 4, // Determines the time between vertical gridlines
      rightGraphMargin: 10, // There is a blank space on the right side of the graph so there is room for the pens
      cornerRadius: 5,
      seriesLineWidth: 2,
      topMargin: 10,
      numberVerticalDashes: 12,
      rightMargin: 10,

      // default options for the Rectangle on top (to make sure graph lines don't protrude)
      graphPanelOverlayOptions: {
        stroke: 'black',
        pickable: false
      },
      graphPanelOptions: null, // filled in below because some defaults are based on other options
      gridLineOptions: null, // filled in below because some defaults are based on other options

      showVerticalGridLabels: true,
      verticalGridLabelNumberOfDecimalPlaces: 0,

      verticalRanges: [ new Range( -1, 1 ) ], // If there is more than one specified vertical range, zoom buttons are displayed
      initialVerticalRangeIndex: 0,

      tandem: Tandem.OPTIONAL
    }, options );

    const zoomLevelIndexProperty = new Property( options.initialVerticalRangeIndex, {
      isValidValue: v => v >= 0 && v < options.verticalRanges.length
    } );
    const verticalRangeProperty = new DerivedProperty( [ zoomLevelIndexProperty ], index => options.verticalRanges[ index ] );

    // Promote to local variables for readability
    const { width, height, numberHorizontalLines, numberVerticalLines } = options;

    // default options to be passed into the graphPanel Rectangle
    options.graphPanelOptions = merge( {
      fill: 'white',

      // This stroke is covered by the front panel stroke, only included here to make sure the bounds align
      stroke: 'black',
      right: width - options.rightMargin,
      top: options.topMargin,
      pickable: false
    }, options.graphPanelOptions );

    // default options for the horizontal and vertical grid lines
    const dashLength = height / options.numberVerticalDashes / 2;
    options.gridLineOptions = merge( {
      stroke: 'lightGray',
      lineDash: [ dashLength + 0.6, dashLength - 0.6 ],
      lineWidth: 0.8,
      lineDashOffset: dashLength / 2
    }, options.gridLineOptions );

    // White panel with gridlines that shows the data
    options.graphPanelOptions = merge( {

      // Prevent data from being plotted outside the graph
      clipArea: Shape.rect( 0, 0, width, height )
    }, options.graphPanelOptions );
    const graphPanel = new Rectangle( 0, 0, width, height, options.cornerRadius, options.cornerRadius,
      options.graphPanelOptions
    );

    // Map from data coordinates to chart coordinates. Note that the "x" axis is the "time" axis in most or all cases
    const modelViewTransform = new ModelViewTransform2();

    // @private {MultiLink}
    this.dataMappingLink = Property.multilink( [ timeProperty, verticalRangeProperty ], ( time, verticalRange ) => {
      modelViewTransform.setToRectangleInvertedYMapping(
        new Bounds2( time - 4, verticalRange.min, time, verticalRange.max ),
        new Bounds2( 0, 0, width - options.rightGraphMargin, height )
      );
    } );
    const gridLineLayer = new Node();
    graphPanel.addChild( gridLineLayer );
    const gridLabelLayer = new Node();
    this.addChild( gridLabelLayer );

    verticalRangeProperty.link( () => {

      const gridLineChildren = [];
      const gridLabelChildren = [];

      // Horizontal lines indicate increasing vertical value
      const horizontalLabelMargin = -3;
      for ( let i = 0; i <= numberHorizontalLines + 1; i++ ) {
        const y = height * i / ( numberHorizontalLines + 1 );
        const line = new Line( 0, y, width, y, options.gridLineOptions );
        if ( i !== 0 && i !== numberHorizontalLines + 1 ) {
          gridLineChildren.push( line );
        }

        const b = graphPanel.localToParentBounds( line.bounds );
        const yValue = modelViewTransform.viewToModelY( y );
        if ( options.showVerticalGridLabels ) {

          // TODO: Should number of decimal places depend on value or perhaps on zoom level?
          // We want to show -2 -1 0 1 2, but also -0.5, 0, 0.5, right? See https://github.com/phetsims/griddle/issues/47
          gridLabelChildren.push( new Text( Utils.toFixed( yValue, options.verticalGridLabelNumberOfDecimalPlaces ), {
            fill: 'white',
            rightCenter: b.leftCenter.plusXY( horizontalLabelMargin, 0 )
          } ) );
        }
      }
      gridLineLayer.children = gridLineChildren;
      gridLabelLayer.children = gridLabelChildren;
    } );

    const plotWidth = width - options.rightGraphMargin;

    // Vertical lines
    for ( let i = 1; i <= numberVerticalLines; i++ ) {
      const x = plotWidth * i / numberVerticalLines;
      graphPanel.addChild( new Line( x, 0, x, height, options.gridLineOptions ) );
    }

    this.addChild( graphPanel );

    if ( options.verticalRanges.length > 1 ) {
      const zoomButtonOptions = {
        left: graphPanel.right + 5,
        baseColor: '#97c7fa',
        radius: 6,
        xMargin: 5,
        yMargin: 3
      };

      const zoomInButton = new ZoomButton( merge( {
        in: true,
        top: graphPanel.top,
        listener: () => zoomLevelIndexProperty.value--,
        tandem: options.tandem.createTandem( 'zoomInButton' )
      }, zoomButtonOptions ) );
      this.addChild( zoomInButton );

      const zoomOutButton = new ZoomButton( merge( {
        in: false,
        top: zoomInButton.bottom + 5,
        listener: () => zoomLevelIndexProperty.value++,
        tandem: options.tandem.createTandem( 'zoomOutButton' )
      }, zoomButtonOptions ) );
      this.addChild( zoomOutButton );

      zoomLevelIndexProperty.link( zoomLevelIndex => {
        zoomOutButton.enabled = zoomLevelIndex < options.verticalRanges.length - 1;
        zoomInButton.enabled = zoomLevelIndex > 0;
      } );
    }

    // @private - for disposal
    this.scrollingChartNodeDisposeEmitter = new Emitter();

    /**
     * Creates and adds a dynamicSeries with the given color
     * @param {DynamicSeries} dynamicSeries - see constructor docs
     */
    const addDynamicSeries = dynamicSeries => {
      const dynamicSeriesNode = new DynamicSeriesNode(
        dynamicSeries,
        plotWidth,
        graphPanel.bounds,
        numberVerticalLines,
        timeProperty,
        modelViewTransform
      );
      graphPanel.addChild( dynamicSeriesNode );
      this.scrollingChartNodeDisposeEmitter.addListener( () => dynamicSeriesNode.dispose() );
    };

    dynamicSeriesArray.forEach( addDynamicSeries );

    // Stroke on front panel is on top, so that when the curves go to the edges they do not overlap the border stroke.
    // This is a faster alternative to clipping.
    graphPanel.addChild( new Rectangle( 0, 0, width, height, options.cornerRadius, options.cornerRadius, options.graphPanelOverlayOptions ) );

    /* -------------------------------------------
     * Optional decorations
     * -------------------------------------------*/

    // Position the vertical axis title node
    verticalAxisLabelNode.mutate( {
      maxHeight: graphPanel.height,
      right: this.bounds.minX - VERTICAL_AXIS_LABEL_MARGIN, // whether or not there are vertical axis labels, position to the left
      centerY: graphPanel.centerY
    } );
    this.addChild( verticalAxisLabelNode );

    const spanNode = new SpanNode( spanLabelNode, plotWidth / 4, {
      left: graphPanel.left,
      top: graphPanel.bottom + 2
    } );

    this.addChild( spanNode );
    this.addChild( horizontalAxisLabelNode );

    // For i18n, “Time” will expand symmetrically L/R until it gets too close to the scale bar. Then, the string will
    // expand to the R only, until it reaches the point it must be scaled down in size.
    horizontalAxisLabelNode.maxWidth = graphPanel.right - spanNode.right - 2 * HORIZONTAL_AXIS_LABEL_MARGIN;

    // Position the horizontal axis title node after its maxWidth is specified
    horizontalAxisLabelNode.mutate( {
      top: graphPanel.bottom + LABEL_GRAPH_MARGIN,
      centerX: plotWidth / 2 + graphPanel.bounds.minX
    } );
    if ( horizontalAxisLabelNode.left < spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN ) {
      horizontalAxisLabelNode.left = spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN;
    }

    this.mutate( options );

    // @private
    this.resetScrollingChartNode = () => {
      zoomLevelIndexProperty.reset();
    };
  }

  /**
   * @public - restore initial conditions
   */
  reset() {
    this.resetScrollingChartNode();

    // TODO: who is responsible for clearing the dynamicSeriesArray?  See https://github.com/phetsims/griddle/issues/48
  }

  /**
   * Releases resources when no longer used.
   * @public
   */
  dispose() {
    this.scrollingChartNodeDisposeEmitter.emit();
    this.scrollingChartNodeDisposeEmitter.dispose();
    Property.unmultilink( this.dataMappingLink );
    super.dispose();
  }
}

griddle.register( 'ScrollingChartNode', ScrollingChartNode );
export default ScrollingChartNode;