// Copyright 2018, University of Colorado Boulder

/**
 * The scrolling graph component, which would typically be embedded in a Panel.  Like a seismograph, it has pens on the
 * right hand side that record data, and the paper scrolls to the left.  It is currently sized accordingly to be used in
 * a small draggable sensor, like the ones in Wave Interference, Bending Light or Circuit Construction Kit: AC.
 *
 * Please see the demo in http://localhost/griddle/griddle_en.html
 *
 * Moved from wave-interference repo to griddle repo on Wed, Aug 29, 2018.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Emitter = require( 'AXON/Emitter' );
  const griddle = require( 'GRIDDLE/griddle' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  const PATH_LINE_WIDTH = 2;
  const TOP_MARGIN = 10;
  const RIGHT_MARGIN = 10;
  const GRAPH_CORNER_RADIUS = 5;
  const AXIS_LABEL_FILL = 'white';
  const LABEL_GRAPH_MARGIN = 3;
  const LABEL_EDGE_MARGIN = 6;
  const HORIZONTAL_AXIS_LABEL_MARGIN = 4;
  const LABEL_FONT_SIZE = 14;
  const NUMBER_VERTICAL_DASHES = 12;
  const LINE_WIDTH = 0.8;

  // There is a blank space on the right side of the graph so there is room for the pens
  const RIGHT_GRAPH_MARGIN = 10;

  class ScrollingChartNode extends Node {

    /**
     * @param {Node} verticalAxisTitleNode - node to show along the vertical axis
     * @param {Node} scaleIndicatorTextNode - node that shows the extent between the first two time divisions
     * @param {NumberProperty} timeProperty - indicates the passage of time in the model
     * @param {number} width - width of the entire node, which includes the labels (this is not the width of the chart grid alone)
     * @param {number} height - height of the entire node, which includes the labels (this is not the height of the chart grid alone)
     * @param {Object[]} seriesArray, each element has {data: Vector2[],emitter: Emitter, color: Color}
     * @param {string} timeString - text shown beneath the horizontal axis
     * @param {Object} [options]
     */
    constructor( verticalAxisTitleNode, scaleIndicatorTextNode, timeProperty, width, height, seriesArray, timeString, options ) {
      super();

      options = _.extend( {
        timeDivisions: 4
      }, options );

      const horizontalAxisTitleNode = new Text( timeString, {
        fontSize: LABEL_FONT_SIZE,
        fill: AXIS_LABEL_FILL
      } );

      const leftMargin = LABEL_EDGE_MARGIN + verticalAxisTitleNode.width + LABEL_GRAPH_MARGIN;
      const bottomMargin = LABEL_EDGE_MARGIN + horizontalAxisTitleNode.height + LABEL_GRAPH_MARGIN;

      const graphWidth = width - leftMargin - RIGHT_MARGIN;
      const graphHeight = height - TOP_MARGIN - bottomMargin;

      // Now that we have computed the graphHeight, use it to limit the text size for the vertical axis label
      verticalAxisTitleNode.maxHeight = graphHeight;

      const dashLength = graphHeight / NUMBER_VERTICAL_DASHES / 2;
      const dashPattern = [ dashLength + 0.6, dashLength - 0.6 ];
      const lineOptions = {
        stroke: 'lightGray',
        lineDash: dashPattern,
        lineWidth: LINE_WIDTH,
        lineDashOffset: dashLength / 2
      };

      // White panel with gridlines that shows the data
      const graphPanel = new Rectangle( 0, 0, graphWidth, graphHeight, GRAPH_CORNER_RADIUS, GRAPH_CORNER_RADIUS, {
        fill: 'white',
        stroke: 'black', // This stroke is covered by the front panel stroke, only included here to make sure the bounds align
        right: width - RIGHT_MARGIN,
        top: TOP_MARGIN,
        pickable: false
      } );

      // Horizontal Lines
      [ 1, 2, 3 ].forEach( i =>
        graphPanel.addChild( new Line( 0, graphHeight * i / 4, graphWidth, graphHeight * i / 4, lineOptions ) )
      );

      const plotWidth = graphWidth - RIGHT_GRAPH_MARGIN;

      // Vertical lines
      [ 1, 2, 3, 4 ].forEach( i =>
        graphPanel.addChild( new Line( plotWidth * i / options.timeDivisions, 0, plotWidth * i / options.timeDivisions, graphHeight, lineOptions ) )
      );

      this.addChild( graphPanel );

      // Position the horizontal axis title node
      horizontalAxisTitleNode.mutate( {
        top: graphPanel.bottom + LABEL_GRAPH_MARGIN,
        centerX: graphPanel.left + plotWidth / 2
      } );

      // Position the vertical axis title node
      verticalAxisTitleNode.mutate( {
        right: graphPanel.left - LABEL_GRAPH_MARGIN,
        centerY: graphPanel.centerY
      } );

      // Create double-headed arrow with bars to show the time between gridlines
      const createBar = centerX => new Line( 0, 0, 0, 6, { stroke: 'white', centerX } );
      const leftBar = createBar( 0 );
      const rightBar = createBar( plotWidth / 4 );
      const arrowNode = new ArrowNode( leftBar.right + 1, leftBar.centerY, rightBar.left - 1, rightBar.centerY, {
        fill: 'white',
        stroke: 'white',
        doubleHead: true,
        headHeight: 3,
        headWidth: 3.5,
        tailWidth: 0.5
      } );
      const arrowWithBars = new Node( {
        children: [ leftBar, rightBar, arrowNode ]
      } );

      // Prevent the scale indicator text from being wider than the corresponding arrow
      scaleIndicatorTextNode.maxWidth = arrowWithBars.width;

      const lengthScaleIndicatorNode = new VBox( {
        spacing: -2,
        children: [ arrowWithBars, scaleIndicatorTextNode ],
        left: graphPanel.left,
        top: graphPanel.bottom + 2
      } );

      this.addChild( lengthScaleIndicatorNode );
      this.addChild( horizontalAxisTitleNode );
      this.addChild( verticalAxisTitleNode );

      // For i18n, “Time” will expand symmetrically L/R until it gets too close to the scale bar. Then, the string will
      // expand to the R only, until it reaches the point it must be scaled down in size.
      horizontalAxisTitleNode.maxWidth = graphPanel.right - lengthScaleIndicatorNode.right - 2 * HORIZONTAL_AXIS_LABEL_MARGIN;
      if ( horizontalAxisTitleNode.left < lengthScaleIndicatorNode.right + HORIZONTAL_AXIS_LABEL_MARGIN ) {
        horizontalAxisTitleNode.left = lengthScaleIndicatorNode.right + HORIZONTAL_AXIS_LABEL_MARGIN;
      }

      // If maxWidth reduced the scale of the text, it may be too far below the graph.  In that case, move it back up.
      horizontalAxisTitleNode.mutate( {
        top: graphPanel.bottom + LABEL_GRAPH_MARGIN
      } );

      // @private - for disposal
      this.scrollingChartNodeDisposeEmitter = new Emitter();

      /**
       * Creates and adds a series with the given color
       * @param {Object} series - see constructor docs
       */
      const addSeries = series => {
        const { color, data, emitter } = series;

        // Create the "pens" which draw the data at the right side of the graph
        const penNode = new Circle( 4.5, {
          fill: color,
          centerX: plotWidth,
          centerY: graphHeight / 2
        } );
        const pathNode = new Path( new Shape(), {
          stroke: color,
          lineWidth: PATH_LINE_WIDTH,

          // prevent bounds computations during main loop
          boundsMethod: 'none',
          localBounds: Bounds2.NOTHING
        } );
        pathNode.computeShapeBounds = () => Bounds2.NOTHING; // prevent bounds computations during main loop
        graphPanel.addChild( pathNode );
        graphPanel.addChild( penNode );

        const seriesListener = () => {

          // Set the range by incorporating the model's time units, so it will match with the timer.
          const maxSeconds = options.timeDivisions;

          // Draw the graph with line segments
          const pathShape = new Shape();
          for ( let i = 0; i < data.length; i++ ) {
            const dataPoint = data[ i ];
            const scaledValue = Util.linear( 0, 2, graphHeight / 2, 0, dataPoint.y );

            // Clamp at max values
            const clampedValue = Util.clamp( scaledValue, 0, graphHeight );

            const xAxisValue = Util.linear( timeProperty.value, timeProperty.value - maxSeconds, plotWidth, 0, dataPoint.x );
            pathShape.lineTo( xAxisValue, clampedValue );
            if ( i === data.length - 1 ) {
              penNode.centerY = clampedValue;
            }
          }
          pathNode.shape = pathShape;
        };
        emitter.addListener( seriesListener );
        this.scrollingChartNodeDisposeEmitter.addListener( () => emitter.removeListener( seriesListener ) );
      };

      seriesArray.forEach( addSeries );

      // Stroke on front panel is on top, so that when the curves go to the edges they do not overlap the border stroke.
      // This is a faster alternative to clipping.
      graphPanel.addChild( new Rectangle( 0, 0, graphWidth, graphHeight, GRAPH_CORNER_RADIUS, GRAPH_CORNER_RADIUS, {
        stroke: 'black',
        pickable: false
      } ) );

      this.mutate( options );
    }

    /**
     * Releases resources when no longer used.
     * @public
     */
    dispose() {
      this.scrollingChartNodeDisposeEmitter.emit();
      this.scrollingChartNodeDisposeEmitter.dispose();
    }
  }

  return griddle.register( 'ScrollingChartNode', ScrollingChartNode );
} );