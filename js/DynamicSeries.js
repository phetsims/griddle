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
  const merge = require( 'PHET_CORE/merge' );
  const Vector2 = require( 'DOT/Vector2' );

  // TODO: https://github.com/phetsims/griddle/issues/46 documentation or eliminate
  let count = 0;

  class DynamicSeries {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {

      // @public {Vector2[]} - the data points in the series.  A NaN "y" value indicates there is no sample at that
      // point in time
      // TODO: https://github.com/phetsims/griddle/issues/46 should be private
      this.data = [];

      this.uniqueId = count++; // TODO: https://github.com/phetsims/griddle/issues/46 eliminate this

      // @public {Emitter} -  sends notification when the data series changes // TODO: https://github.com/phetsims/griddle/issues/46 should be private
      this.emitter = new Emitter();

      options = merge( {
        color: 'black',
        lineWidth: 1,
        radius: 2 // TODO: https://github.com/phetsims/griddle/issues/46 eliminate?
      }, options );

      // @public (read-only) {Color}
      this.color = options.color;

      // @public (read-only) {number}
      this.lineWidth = options.lineWidth;

      this.radius = options.radius; // TODO: https://github.com/phetsims/griddle/issues/46 eliminate or document
    }

    /**
     * Returns the number of points in the data series.
     * @returns {number}
     */
    getLength() {
      return this.data.length;
    }

    /**
     * Adds a listener when the data series changes.
     * @param {function} listener
     */
    addDynamicSeriesListener( listener ) {
      this.emitter.addListener( listener );
    }

    /**
     * Remove all data from the DynamicSeries
     * @public
     */
    clear() {
      this.data.length = 0;
      this.emitter.emit();
    }

    addPoint( x, y ) {
      this.data.push( new Vector2( x, y ) );
      this.emitter.emit();
    }

    /**
     * Remove a point in the data series with the provided x value. Does not remove duplicates, only the first
     * occurrence of the value starting at the beginning of the xPoints list.
     * @public
     *
     * @param {number} x
     */
    removePointAtX( x ) {
      for ( let i = 0; i < this.data.length; i++ ) {
        const point = this.data[ i ];
        if ( point.x === x ) {
          this.data.splice( i, 1 );
          this.emitter.emit();
          break;
        }
      }
    }
  }

  return griddle.register( 'DynamicSeries', DynamicSeries );
} );