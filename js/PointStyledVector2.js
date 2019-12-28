// Copyright 2019, University of Colorado Boulder

/**
 * Extends Vector2 and adds PointStyle, so that individual points in a data series can be drawn with different styles.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const griddle = require( 'GRIDDLE/griddle' );
  const PointStyle = require( 'GRIDDLE/PointStyle' );
  const Vector2 = require( 'DOT/Vector2' );

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

  return griddle.register( 'PointStyledVector2', PointStyledVector2 );
} );