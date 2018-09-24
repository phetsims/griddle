// Copyright 2018, University of Colorado Boulder

/**
 * Decorates a ScrollingChartNode with titles and labels.
 *
 * Please see the demo in http://localhost/griddle/griddle_en.html
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const griddle = require( 'GRIDDLE/griddle' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  const AXIS_LABEL_FILL = 'white';
  const LABEL_GRAPH_MARGIN = 3;
  const HORIZONTAL_AXIS_LABEL_MARGIN = 4;
  const LABEL_FONT_SIZE = 14;

  class LabeledScrollingChartNode extends Node {

    /**
     * @param {ScrollingChartNode} scrollingChartNode - scrolling chart node to decorate.  Needed to get dimensions between gridlines
     * @param {Node} verticalAxisTitleNode - node to show along the vertical axis
     * @param {Node} scaleIndicatorTextNode - node that shows the extent between the first two time divisions
     * @param {string} timeString - text shown beneath the horizontal axis
     * @param {Object} [options]
     */
    constructor( scrollingChartNode, verticalAxisTitleNode, scaleIndicatorTextNode, timeString, options ) {
      super();

      options = _.extend( {
        timeDivisions: 4
      }, options );

      const horizontalAxisTitleNode = new Text( timeString, {
        fontSize: LABEL_FONT_SIZE,
        fill: AXIS_LABEL_FILL
      } );

      // Now that we have computed the graphHeight, use it to limit the text size for the vertical axis label
      verticalAxisTitleNode.maxHeight = scrollingChartNode.height;

      this.addChild( scrollingChartNode );

      // Position the horizontal axis title node
      horizontalAxisTitleNode.mutate( {
        top: scrollingChartNode.bottom + LABEL_GRAPH_MARGIN,
        centerX: scrollingChartNode.plotWidth / 2 + scrollingChartNode.bounds.minX
      } );

      // Position the vertical axis title node
      verticalAxisTitleNode.mutate( {
        right: scrollingChartNode.left - LABEL_GRAPH_MARGIN,
        centerY: scrollingChartNode.centerY
      } );

      // Create double-headed arrow with bars to show the time between gridlines
      const createBar = centerX => new Line( 0, 0, 0, 6, { stroke: 'white', centerX } );
      const leftBar = createBar( 0 );
      const rightBar = createBar( scrollingChartNode.plotWidth / 4 );
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
        left: scrollingChartNode.left,
        top: scrollingChartNode.bottom + 2
      } );

      this.addChild( lengthScaleIndicatorNode );
      this.addChild( horizontalAxisTitleNode );
      this.addChild( verticalAxisTitleNode );

      // For i18n, “Time” will expand symmetrically L/R until it gets too close to the scale bar. Then, the string will
      // expand to the R only, until it reaches the point it must be scaled down in size.
      horizontalAxisTitleNode.maxWidth = scrollingChartNode.right - lengthScaleIndicatorNode.right - 2 * HORIZONTAL_AXIS_LABEL_MARGIN;
      if ( horizontalAxisTitleNode.left < lengthScaleIndicatorNode.right + HORIZONTAL_AXIS_LABEL_MARGIN ) {
        horizontalAxisTitleNode.left = lengthScaleIndicatorNode.right + HORIZONTAL_AXIS_LABEL_MARGIN;
      }

      // If maxWidth reduced the scale of the text, it may be too far below the graph.  In that case, move it back up.
      horizontalAxisTitleNode.mutate( {
        top: scrollingChartNode.bottom + LABEL_GRAPH_MARGIN
      } );

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

  return griddle.register( 'LabeledScrollingChartNode', LabeledScrollingChartNode );
} );