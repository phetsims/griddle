// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents a data series that has a color and associated data points which may change.  The change is signified with
 * an Emitter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../axon/js/Emitter.js';
import Vector2 from '../../dot/js/Vector2.js';
import merge from '../../phet-core/js/merge.js';
import griddle from './griddle.js';

class DynamicSeries {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    // @private {Vector2[]} - the data points in the series.  A NaN "y" value indicates there is no sample at that
    // point in time
    this.data = [];

    // @private {Emitter} -  sends notification when the data series changes
    this.emitter = new Emitter();

    options = merge( {
      color: 'black',
      lineWidth: 1,
      radius: 2
    }, options );

    // @public (read-only) {Color}
    this.color = options.color;

    // @public (read-only) {number}
    this.lineWidth = options.lineWidth;

    // @public (read-only) {number}
    this.radius = options.radius;
  }

  /**
   * Removes the first data point
   * @public
   */
  shiftData() {
    this.data.shift();
    this.emitter.emit();
  }

  /**
   * Returns the number of points in the data series.
   * @returns {number}
   * @public
   */
  getLength() {
    return this.data.length;
  }

  /**
   * Adds a listener when the data series changes.
   * @param {function} listener
   * @public
   */
  addDynamicSeriesListener( listener ) {
    this.emitter.addListener( listener );
  }

  /**
   * Removes a listener when the data series changes.
   * @param {function} listener
   * @public
   */
  removeDynamicSeriesListener( listener ) {
    this.emitter.removeListener( listener );
  }

  /**
   * Remove all data from the DynamicSeries
   * @public
   */
  clear() {
    this.data.length = 0;
    this.emitter.emit();
  }

  /**
   * Adds an (x,y) point
   * @param {number} x
   * @param {number} y
   * @public
   */
  addXYDataPoint( x, y ) {
    this.addDataPoint( new Vector2( x, y ) );
  }

  /**
   * Adds a Vector2 data point
   * @param {Vector2} dataPoint
   * @public
   */
  addDataPoint( dataPoint ) {
    this.data.push( dataPoint );
    this.emitter.emit();
  }

  /**
   * Returns the data point at the specified index.
   * @param {number} index
   * @returns {Vector2}
   */
  getDataPoint( index ) {
    return this.data[ index ];
  }

  /**
   * Returns true if there are any data points.
   * @returns {boolean}
   */
  hasData() {
    return this.data.length > 0;
  }

  /**
   * Remove a point in the data series with the provided x value. Does not remove duplicates, only the first
   * occurrence of the value starting at the beginning of the xPoints list.
   * @param {number} x
   * @param {boolean} withRedraw - if false, points can be removed without emitting to redraw (for performance)
   * @public
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

griddle.register( 'DynamicSeries', DynamicSeries );
export default DynamicSeries;