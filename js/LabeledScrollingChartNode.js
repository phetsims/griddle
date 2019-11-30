// Copyright 2018-2019, University of Colorado Boulder

/**
 * Decorates a ScrollingChartNode with titles and labels.  This does not show a background, and would typically be added
 * to a Panel or ShadedRectangle.
 *
 * Please see the demo in http://localhost/griddle/griddle_en.html
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const griddle = require( 'GRIDDLE/griddle' );
  const Node = require( 'SCENERY/nodes/Node' );
  const SpanNode = require( 'GRIDDLE/SpanNode' );

  // constants
  const LABEL_GRAPH_MARGIN = 3;
  const HORIZONTAL_AXIS_LABEL_MARGIN = 4;

  class LabeledScrollingChartNode extends Node {

    /**
     * @param {ScrollingChartNode} scrollingChartNode - scrolling chart node to decorate.  Needed to get dimensions between gridlines.
     *                                                - also considered "owned" by this decorator and hence is disposed on dispose()
     * @param {Node} verticalAxisTitleNode - node to show along the vertical axis
     * @param {Node} scaleIndicatorTextNode - node that shows the extent between the first two time divisions
     * @param {Node} horizontalAxisTitleNode - text shown beneath the horizontal axis
     * @param {Object} [options]
     */
    constructor( scrollingChartNode, verticalAxisTitleNode, scaleIndicatorTextNode, horizontalAxisTitleNode, options ) {
      super();

      this.addChild( scrollingChartNode );

      // Position the vertical axis title node
      verticalAxisTitleNode.mutate( {
        maxHeight: scrollingChartNode.height,
        right: scrollingChartNode.left - LABEL_GRAPH_MARGIN,
        centerY: scrollingChartNode.centerY
      } );

      const spanNode = new SpanNode( scaleIndicatorTextNode, scrollingChartNode.plotWidth / 4, {
        left: scrollingChartNode.left,
        top: scrollingChartNode.bottom + 2
      } );

      this.addChild( spanNode );
      this.addChild( horizontalAxisTitleNode );
      this.addChild( verticalAxisTitleNode );

      // For i18n, “Time” will expand symmetrically L/R until it gets too close to the scale bar. Then, the string will
      // expand to the R only, until it reaches the point it must be scaled down in size.
      horizontalAxisTitleNode.maxWidth = scrollingChartNode.right - spanNode.right - 2 * HORIZONTAL_AXIS_LABEL_MARGIN;

      // Position the horizontal axis title node after its maxWidth is specified
      horizontalAxisTitleNode.mutate( {
        top: scrollingChartNode.bottom + LABEL_GRAPH_MARGIN,
        centerX: scrollingChartNode.plotWidth / 2 + scrollingChartNode.bounds.minX
      } );

      if ( horizontalAxisTitleNode.left < spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN ) {
        horizontalAxisTitleNode.left = spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN;
      }

      this.mutate( options );
    }

    /**
     * Releases resources when no longer used.
     * @public
     */
    dispose() {
      assert && assert( false, 'Call unexpected' );
    }
  }

  return griddle.register( 'LabeledScrollingChartNode', LabeledScrollingChartNode );
} );