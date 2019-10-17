// Copyright 2018-2019, University of Colorado Boulder

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
  const DynamicSeriesNode = require( 'GRIDDLE/DynamicSeriesNode' );
  const Emitter = require( 'AXON/Emitter' );
  const griddle = require( 'GRIDDLE/griddle' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );

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

      // default options for the Rectangle on top (to make sure graph lines don't protrude)
      options.graphPanelOverlayOptions = merge( {
        stroke: 'black',
        pickable: false
      }, options.graphPanelOverlayOptions );

      // White panel with gridlines that shows the data
      options.graphPanelOptions = merge( {

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
       * @param {DynamicSeries} dynamicSeries - see constructor docs
       */
      const addDynamicSeries = dynamicSeries => {
        const dynamicSeriesNode = new DynamicSeriesNode(
          dynamicSeries,
          plotWidth,
          graphPanel.bounds,
          numberVerticalLines,
          timeProperty
        );
        graphPanel.addChild( dynamicSeriesNode );
        this.scrollingChartNodeDisposeEmitter.addListener( () => dynamicSeriesNode.dispose() );
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
      super.dispose();
    }
  }

  return griddle.register( 'ScrollingChartNode', ScrollingChartNode );
} );