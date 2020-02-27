// Copyright 2020, University of Colorado Boulder

/**
 * Utilities used by griddle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import griddle from './griddle.js';

const GriddleUtils = {

  /**
   * Returns values between min<=value<=max such that value = anchor + n*delta, where n is any integer
   * @param {number} min - minimum value (inclusive)
   * @param {number} max - maximum value (inclusive)
   * @param {number} [delta] - spacing
   * @param {number} [anchor] - origin or value guaranteed to match, typically zero
   * @returns {number[]}
   * @public
   */
  getValuesInRangeWithAnchor( min, max, delta = 1, anchor = 0 ) {

    const nMin = Math.floor( ( min - anchor ) / delta );
    const nMax = Math.ceil( ( max - anchor ) / delta );

    const results = [];
    for ( let n = nMin; n <= nMax; n++ ) {
      const result = anchor + n * delta;
      if ( result >= min && result <= max ) {
        results.push( result );
      }
    }
    return results;
  }
};

griddle.register( 'GriddleUtils', GriddleUtils );
export default GriddleUtils;