// Copyright 2018, University of Colorado Boulder

/**
 * A scrolling graph component.  Like a seismograph, it has pens on the right hand side that record data, and the paper
 * scrolls to the left.  It is currently sized accordingly to be used in a small draggable sensor, like the ones in Wave
 * Interference, Bending Light or Circuit Construction Kit: AC. It would typically be embedded in a
 * LabeledScrollingChartNode or Panel.
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

      options = _.extend( {
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
        graphPanelOptions: null, // filled in below
        gridLineOptions: null, // filled in below
        graphPanelOverlayOptions: null // filled in below
      }, options );

      // Promote to local variables for readability
      const { width, height, numberHorizontalLines, numberVerticalLines } = options;

      // default options to be passed into the graphPanel Rectangle
      options.graphPanelOptions = _.extend( {
        fill: 'white',

        // This stroke is covered by the front panel stroke, only included here to make sure the bounds align
        stroke: 'black',
        right: width - options.rightMargin,
        top: options.topMargin,
        pickable: false
      }, options.graphPanelOptions );

      // default options for the horizontal and vertical grid lines
      const dashLength = height / options.numberVerticalDashes / 2;
      options.gridLineOptions = _.extend( {
        stroke: 'lightGray',
        lineDash: [ dashLength + 0.6, dashLength - 0.6 ],
        lineWidth: 0.8,
        lineDashOffset: dashLength / 2
      }, options.gridLineOptions );

      // default options for the Rectangle on top (to make sure graph lines don't protrude)
      options.graphPanelOverlayOptions = _.extend( {
        stroke: 'black',
        pickable: false
      }, options.graphPanelOverlayOptions );

      // White panel with gridlines that shows the data
      options.graphPanelOptions = _.extend( {

        // Prevent data from being plotted outside the graph
        clipArea: Shape.rect( 0, 0, width, height )
      }, options.graphPanelOptions );
      const graphPanel = new Rectangle( 0, 0, width, height, options.cornerRadius, options.cornerRadius,
        options.graphPanelOptions
      );

      // Horizontal Lines
      for ( let i = 1; i <= numberHorizontalLines; i++ ) {
        const y = height * i / ( numberHorizontalLines + 1 );
        graphPanel.addChild( new Line( 0, y, width, y, options.gridLineOptions ) );
      }

      const plotWidth = width - options.rightGraphMargin;

      // @public (read-only) {number} - the width of the area that is used for plotting, does not include the margin
      // on the right.
      this.plotWidth = plotWidth;

      // Vertical lines
      for ( let i = 1; i <= numberVerticalLines; i++ ) {
        const x = plotWidth * i / numberVerticalLines;
        graphPanel.addChild( new Line( x, 0, x, height, options.gridLineOptions ) );
      }

      this.addChild( graphPanel );

      // @private - for disposal
      this.scrollingChartNodeDisposeEmitter = new Emitter();

      /**
       * Creates and adds a dynamicSeries with the given color
       * @param {Object} dynamicSeries - see constructor docs
       */
      const addDynamicSeries = dynamicSeries => {

        // Create the "pens" which draw the data at the right side of the graph
        const penNode = new Circle( 4.5, {
          fill: dynamicSeries.color,
          centerX: plotWidth,
          centerY: height / 2
        } );
        const dynamicSeriesPath = new Path( new Shape(), {
          stroke: dynamicSeries.color,
          lineWidth: dynamicSeries.lineWidth,

          // prevent bounds computations during main loop
          boundsMethod: 'none',
          localBounds: Bounds2.NOTHING
        } );
        dynamicSeriesPath.computeShapeBounds = () => Bounds2.NOTHING; // prevent bounds computations during main loop
        graphPanel.addChild( dynamicSeriesPath );
        graphPanel.addChild( penNode );

        const dynamicSeriesListener = () => {

          // Set the range by incorporating the model's time units, so it will match with the timer.
          const maxTime = numberVerticalLines;

          // Draw the graph with line segments
          const dynamicSeriesPathShape = new Shape();
          for ( let i = 0; i < dynamicSeries.data.length; i++ ) {
            const dataPoint = dynamicSeries.data[ i ];
            const scaledValue = Util.linear( 0, 2, height / 2, 0, dataPoint.y );

            const time = Util.linear( timeProperty.value, timeProperty.value - maxTime, plotWidth, 0, dataPoint.x );
            dynamicSeriesPathShape.lineTo( time, scaledValue );
            if ( i === dynamicSeries.data.length - 1 ) {
              penNode.centerY = scaledValue;
            }
          }
          dynamicSeriesPath.shape = dynamicSeriesPathShape;
        };
        dynamicSeries.emitter.addListener( dynamicSeriesListener );
        this.scrollingChartNodeDisposeEmitter.addListener( () => {
          dynamicSeries.emitter.removeListener( dynamicSeriesListener )
        } );
      };

      dynamicSeriesArray.forEach( addDynamicSeries );

      // Stroke on front panel is on top, so that when the curves go to the edges they do not overlap the border stroke.
      // This is a faster alternative to clipping.
      graphPanel.addChild( new Rectangle( 0, 0, width, height, options.cornerRadius, options.cornerRadius,
        options.graphPanelOverlayOptions )
      );

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