// Copyright 2018-2020, University of Colorado Boulder

/**
 * Represents a data series that has a color and associated data points which may change.  The change is signified with
 * an Emitter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import Vector2 from '../../dot/js/Vector2.js';
import merge from '../../phet-core/js/merge.js';
import Color from '../../scenery/js/util/Color.js';
import ColorDef from '../../scenery/js/util/ColorDef.js';
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

      // {ColorDef} - color for the visualization of the DynamicSeries
      color: new Color( 'black' ),

      // options for visualization of the data when plot style is DynamicSeriesNode.PlotStyle.LINE
      lineWidth: 1, // {number}
      lineJoin: 'miter', // {string} - one of the CanvasRenderingContext2D.lineJoin values

      // options for visualization of the data when plot style is DynamicSeriesNode.PlotStyle.SCATTER
      radius: 2,

      // {BooleanProperty} - controls visibility of the visualization for the DynamicSeries
      visibleProperty: new BooleanProperty( true )
    }, options );
    assert && assert( ColorDef.isColorDef( options.color ) );

    // @public (read-only) {Color}
    this.color = options.color;

    // @public (read-only) {number}
    this.lineWidth = options.lineWidth;
    this.lineJoin = options.lineJoin;

    // @public (read-only) {number}
    this.radius = options.radius;

    // @public (read-only) {BooleanProperty} - controls whether or not this DynamicSeries will be visible on its
    // chart
    this.visibleProperty = options.visibleProperty;
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
   * @public
   */
  getDataPoint( index ) {
    return this.data[ index ];
  }

  /**
   * Returns true if there are any data points.
   * @returns {boolean}
   * @public
   */
  hasData() {
    return this.data.length > 0;
  }

  /**
   * Remove many data points of the DynamicSeries at once without notifying listeners, then notify
   * listeners once all have been removed (or performance).
   * @public
   *
   * @param {Vector2[]} dataPoints
   */
  removeDataPoints( dataPoints ) {
    dataPoints.forEach( pointToRemove => {
      this.data.slice().forEach( ( dataPoint, index ) => {
        if ( pointToRemove.equals( dataPoint ) ) {
          this.data.splice( index, 1 );
        }
      } );
    } );

    // notify to listeners that data has changed
    this.emitter.emit();
  }

  /**
   * Remove a set of data points, removing one at each provided x value. You may have access
   * to the indepentent variable but not to the y value in the series, this lets you
   * remove many points at once without getting the y values.
   * @public
   *
   * @param {number[]} xValues
   */
  removeDataPointsAtX( xValues ) {
    xValues.forEach( xValueToRemove => {
      this.data.slice().forEach( ( dataPoint, index ) => {
        if ( xValueToRemove === dataPoint.x ) {
          this.data.splice( index, 1 );
        }
      } );
    } );

    // notify to listeners that data has changed
    this.emitter.emit();
  }
}

griddle.register( 'DynamicSeries', DynamicSeries );
export default DynamicSeries;