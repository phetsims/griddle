// Copyright 2020-2021, University of Colorado Boulder

/**
 * SpanNode shows a double-headed arrow pointing to parallel bars, and a text label. It is shown under a chart to
 * indicate the distance between gridlines.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * @deprecated - please use bamboo
 */

import merge from '../../phet-core/js/merge.js';
import ArrowNode from '../../scenery-phet/js/ArrowNode.js';
import Line from '../../scenery/js/nodes/Line.js';
import Node from '../../scenery/js/nodes/Node.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import griddle from './griddle.js';

class SpanNode extends VBox {

  /**
   * @param {Node} labelNode
   * @param {number} viewWidth
   * @param {Object} [options]
   */
  constructor( labelNode, viewWidth, options ) {

    options = merge( {
      spacing: -2
    }, options );

    // Create double-headed arrow with bars to show the distance specified by viewWidth
    const createBar = centerX => new Line( 0, 0, 0, 6, { stroke: 'white', centerX: centerX } );
    const leftBar = createBar( 0 );
    const rightBar = createBar( viewWidth );
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

    // Prevent labelNode from being wider than arrowWithBars
    labelNode.maxWidth = arrowWithBars.width;

    assert && assert( !options.children, 'SpanNode sets children' );
    options.children = [ arrowWithBars, labelNode ];

    super( options );
  }
}

griddle.register( 'SpanNode', SpanNode );
export default SpanNode;