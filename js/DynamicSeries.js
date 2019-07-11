// Copyright 2018-2019, University of Colorado Boulder

/**
 * Represents a data series that has a color and associated data points which may change.  The change is signified with
 * an Emitter.  This type was introduced as a convenience type / data type for ScrollingChartNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Emitter = require( 'AXON/Emitter' );
  const griddle = require( 'GRIDDLE/griddle' );

  class DynamicSeries {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {

      // @public {Vector2[]} - the data points in the series.  A NaN "y" value indicates there is no sample at that
      // point in time
      this.data = [];

      // @public {Emitter} -  sends notification when the data series changes
      this.emitter = new Emitter();

      options = _.extend( {
        color: 'black',
        lineWidth: 1
      }, options );

      // @public (read-only) {Color}
      this.color = options.color;

      // @public (read-only) {number}
      this.lineWidth = options.lineWidth;
    }

    /**
     * Remove all data from the DynamicSeries
     * @public
     */
    clear() {
      this.data.length = 0;
      this.emitter.emit();
    }
  }

  return griddle.register( 'DynamicSeries', DynamicSeries );
} );