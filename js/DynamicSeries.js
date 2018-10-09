// Copyright 2018, University of Colorado Boulder

/**
 * Represents a data series that has a color and associated data points which may change.  The change is signified with
 * an Emitter.  This type was introduced as a convenience type / data type for ScrollingChartNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const griddle = require( 'GRIDDLE/griddle' );

  class DynamicSeries {

    /**
     * @param {Vector2[]} data - the data points in the series
     * @param {Emitter} - sends notification when the data series changes
     * @param {Color|string} - the color associated with this data series
     */
    constructor( data, emitter, color ) {

      // @public {Vector2[]}
      this.data = data;

      // @public {Emitter}
      this.emitter = emitter;

      // @public (read-only) {Color}
      this.color = color;
    }
  }

  return griddle.register( 'DynamicSeries', DynamicSeries );
} );