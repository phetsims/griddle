// Copyright 2020-2022, University of Colorado Boulder

/**
 * SpanNode shows a double-headed arrow pointing to parallel bars, and a text label. It is shown under a chart to
 * indicate the distance between gridlines.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../phet-core/js/merge.js';
import ArrowNode from '../../scenery-phet/js/ArrowNode.js';
import { Line, Node, VBox } from '../../scenery/js/imports.js';
import griddle from './griddle.js';

/**
 * @deprecated - please use BAMBOO/GridLineSet
 */
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

    // In xss fuzzing in particular, the labelNode can be less than 2 units tall, causing it to overlap in an
    // unfortunate way
    if ( -options.spacing > labelNode.height ) {
      options.spacing = -labelNode.height;
    }

    assert && assert( !options.children, 'SpanNode sets children' );
    options.children = [ arrowWithBars, labelNode ];

    super( options );
  }
}

griddle.register( 'SpanNode', SpanNode );
export default SpanNode;