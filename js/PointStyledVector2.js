// Copyright 2019-2020, University of Colorado Boulder

/**
 * Extends Vector2 and adds PointStyle, so that individual points in a data series can be drawn with different styles.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * @deprecated - please use bamboo
 */

import Vector2 from '../../dot/js/Vector2.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import griddle from './griddle.js';
import PointStyle from './PointStyle.js';

class PointStyledVector2 extends Vector2 {

  /**
   * @param {number} x
   * @param {number} y
   * @param {PointStyle} pointStyle
   */
  constructor( x, y, pointStyle ) {
    assert && deprecationWarning( 'Please use bamboo' );
    assert && assert( pointStyle instanceof PointStyle, 'wrong type for pointStyle' );
    super( x, y );

    // @public (read-only) {PointStyle}
    this.pointStyle = pointStyle;
  }
}

griddle.register( 'PointStyledVector2', PointStyledVector2 );
export default PointStyledVector2;