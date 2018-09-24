// Copyright 2018, University of Colorado Boulder

/**
 * The scrolling graph component, which would typically be embedded in a LabeledScrollingChartNode or Panel.  Like a
 * seismograph, it has pens on the right hand side that record data, and the paper scrolls to the left.  It is currently
 * sized accordingly to be used in a small draggable sensor, like the ones in Wave Interference, Bending Light or
 * Circuit Construction Kit: AC.
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
  const Bounds2 = require( 'DOT/Bounds2' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Emitter = require( 'AXON/Emitter' );
  const griddle = require( 'GRIDDLE/griddle' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );

  // constants
  const PATH_LINE_WIDTH = 2;
  const TOP_MARGIN = 10;
  const RIGHT_MARGIN = 10;
  const GRAPH_CORNER_RADIUS = 5;
  const NUMBER_VERTICAL_DASHES = 12;
  const LINE_WIDTH = 0.8;

  // There is a blank space on the right side of the graph so there is room for the pens
  const RIGHT_GRAPH_MARGIN = 10;

  class ScrollingChartNode extends Node {

    /**
     * @param {NumberProperty} timeProperty - indicates the passage of time in the model
     * @param {Object[]} seriesArray, each element has {data: Vector2[],emitter: Emitter, color: Color}
     * @param {number} width - width of the entire node, which includes the labels (this is not the width of the chart grid alone)
     * @param {number} height - height of the entire node, which includes the labels (this is not the height of the chart grid alone)
     * @param {Object} [options]
     */
    constructor( timeProperty, seriesArray, width, height, options ) {
      super();

      options = _.extend( {
        timeDivisions: 4
      }, options );

      const dashLength = height / NUMBER_VERTICAL_DASHES / 2;
      const dashPattern = [ dashLength + 0.6, dashLength - 0.6 ];
      const lineOptions = {
        stroke: 'lightGray',
        lineDash: dashPattern,
        lineWidth: LINE_WIDTH,
        lineDashOffset: dashLength / 2
      };

      // White panel with gridlines that shows the data
      const graphPanel = new Rectangle( 0, 0, width, height, GRAPH_CORNER_RADIUS, GRAPH_CORNER_RADIUS, {
        fill: 'white',
        stroke: 'black', // This stroke is covered by the front panel stroke, only included here to make sure the bounds align
        right: width - RIGHT_MARGIN,
        top: TOP_MARGIN,
        pickable: false
      } );

      // Horizontal Lines
      [ 1, 2, 3 ].forEach( i =>
        graphPanel.addChild( new Line( 0, height * i / 4, width, height * i / 4, lineOptions ) )
      );

      const plotWidth = width - RIGHT_GRAPH_MARGIN;

      // @public (read-only) {number} - the width of the area that is used for plotting, does not include the margin
      // on the right.
      this.plotWidth = plotWidth;

      // Vertical lines
      [ 1, 2, 3, 4 ].forEach( i =>
        graphPanel.addChild( new Line( plotWidth * i / options.timeDivisions, 0, plotWidth * i / options.timeDivisions, height, lineOptions ) )
      );

      this.addChild( graphPanel );

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
          centerY: height / 2
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
            const scaledValue = Util.linear( 0, 2, height / 2, 0, dataPoint.y );

            // Clamp at max values
            const clampedValue = Util.clamp( scaledValue, 0, height );

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
      graphPanel.addChild( new Rectangle( 0, 0, width, height, GRAPH_CORNER_RADIUS, GRAPH_CORNER_RADIUS, {
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