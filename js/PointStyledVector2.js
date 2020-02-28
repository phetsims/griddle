// Copyright 2019-2020, University of Colorado Boulder

/**
 * Extends Vector2 and adds PointStyle, so that individual points in a data series can be drawn with different styles.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../dot/js/Vector2.js';
import griddle from './griddle.js';
import PointStyle from './PointStyle.js';

class PointStyledVector2 extends Vector2 {

  /**
   * @param {number} x
   * @param {number} y
   * @param {PointStyle} pointStyle
   */
  constructor( x, y, pointStyle ) {
    assert && assert( pointStyle instanceof PointStyle, 'wrong type for pointStyle' );
    super( x, y );

    // @public {PointStyle}
    this.pointStyle = pointStyle;
  }
}

griddle.register( 'PointStyledVector2', PointStyledVector2 );
export default PointStyledVector2;