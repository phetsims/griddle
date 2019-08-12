// Copyright 2014-2019, University of Colorado Boulder

/**
 * XY Data series for a plot. When added to an XYPlot, adding points to the series will allow points to be drawn
 * on the XYPlot.
 *
 * @author Sam Reid
 * @author Aadish Gupta
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var Emitter = require( 'AXON/Emitter' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PointStyle = require( 'GRIDDLE/PointStyle' );

  // for the uniqueId, see this.uniqueId for information
  var instanceCount = 0;

  function XYDataSeries( options ) {

    options = _.extend( {
      color: 'black',
      lineWidth: 1,

      // options specific to scatter plot
      radius: 2, //radius if individual scatter points

      // size of array to initially allocate for the series, specify expected max in options for best performance
      initialSize: 1000
    }, options );

    // @public (read-only) - each instance is given a uniqueId so that it can be mapped to an XYDataSeriesNode.
    // TODO: When we can use native maps, this should no longer be necessary, see https://github.com/phetsims/tasks/issues/992
    this.uniqueId = instanceCount++;

    this.cleared = new Emitter(); // @public, event emitted when the series is cleared
    this.color = options.color; // @public
    this.lineWidth = options.lineWidth; // @public
    this.radius = options.radius; // @public
    this.listeners = []; // @private

    this.xPoints = new Array( options.initialSize ); // @private
    this.yPoints = new Array( options.initialSize ); // @private

    // {Array.<PointStyle>} - styles options for individual points
    this.pointStyles = new Array( options.initialSize ); // @private

    this.dataSeriesLength = 0; // @private, index to next available slot
  }

  griddle.register( 'XYDataSeries', XYDataSeries );

  return inherit( Object, XYDataSeries, {

    addDataSeriesListener: function( listener ) {
      this.listeners.push( listener );
    },

    removeDataSeriesListener: function( listener ) {
      var index = this.listeners.indexOf( listener );
      if ( index !== -1 ) {
        this.listeners.splice( index, 1 );
      }
    },

    /**
     * Add a point to the series, and optionally specify the style of the point when plotted visually.
     *
     * @param {number} x
     * @param {number} y
     * @param {PointStyle} [pointStyle] - optional
     */
    addPoint: function( x, y, pointStyle ) {

      var index = this.dataSeriesLength;

      // point to the next slot
      this.dataSeriesLength++;

      // store the data
      this.xPoints[ index ] = x;
      this.yPoints[ index ] = y;
      this.pointStyles[ index ] = pointStyle ? pointStyle : null;

      // sanity check
      assert && assert( this.dataSeriesLength >= 0, 'length should never be less than zero' );

      this.notifyListeners( index );
    },

    // notify listeners - note that the previous data series values can be undefined in the notification
    notifyListeners: function( index ) {
      const lastIndex = this.dataSeriesLength;
      const lastX = this.xPoints[ lastIndex - 1 ];
      const lastY = this.yPoints[ lastIndex - 1 ];

      const pointBeforeLastX = this.xPoints[ lastIndex - 2 ];
      const pointBeforeLastY = this.yPoints[ lastIndex - 2 ];

      // notify listeners - note that the previous data series values can be undefined in the notification
      for ( var i = 0; i < this.listeners.length; i++ ) {
        this.listeners[ i ]( lastX, lastY, pointBeforeLastX, pointBeforeLastY );
      }
    },

    /**
     * Remove the last point from both x and y data lists. xPoints and yPoints have preallocated sizes, so instead of
     * splicing, we fill in the points at index with 0.
     * @public
     *
     * @param {number} index
     */
    removePoint: function( index ) {

      // previous slot
      this.dataSeriesLength--;

      // remove the point from the array, then splice to end of array to preserve array length for performance during
      // addPoint
      this.xPoints = this.xPoints.concat( this.xPoints.splice( index, 1 ) );
      this.yPoints = this.yPoints.concat( this.yPoints.splice( index, 1 ) );
      this.pointStyles = this.pointStyles.concat( this.pointStyles.splice( index, 1 ) );

      // sanity check
      assert && assert( this.dataSeriesLength >= 0, 'dataSeriesLength should never be below zero' );

      this.notifyListeners( this.dataSeriesLength );
    },

    /**
     * Fast way to remove a number of points at once for the series. Listeners are only called once after all points
     * between startIndex and endIndex are removed.
     * @public
     *
     * @param {number} startIndex - index of first point to remove
     * @param {number} endIndex - index of last point to remove
     */
    removePoints: function( startIndex, endIndex ) {
      assert && assert( startIndex < this.xPoints.length, 'startIndex larger than xPoints length' );
      assert && assert( startIndex < this.yPoints.length, 'startIndex larger than yPoints length' );
      assert && assert( endIndex <= this.xPoints.length, 'endIndex larger than xPoints length' );
      assert && assert( endIndex <= this.yPoints.length, 'endIndex larger than yPoints length' );
      assert && assert( endIndex > startIndex, 'startIndex larger than end index' );

      // just used for sanity checks
      const lengthBeforeRemoval = this.xPoints.length;

      const numberToRemove = endIndex - startIndex;
      this.xPoints = this.xPoints.concat( this.xPoints.splice( startIndex, numberToRemove ) );
      this.yPoints = this.yPoints.concat( this.yPoints.splice( startIndex, numberToRemove ) );
      this.pointStyles = this.pointStyles.concat( this.pointStyles.splice( startIndex, numberToRemove ) );

      this.dataSeriesLength -= numberToRemove;

      // sanity checks
      assert && assert( this.xPoints.length === this.yPoints.length, 'x and y data should be of the same length' );
      assert && assert( this.xPoints.length === lengthBeforeRemoval, 'data arrays should not change size during point removal' );
      assert && assert( this.dataSeriesLength >= 0, 'length should never be non-zero' );

      this.notifyListeners( this.dataSeriesLength );
    },

    /**
     * Remove a point in the data series with the provided x value. Does not remove duplicates, only the first
     * occurrence of the value starting at the beginning of the xPoints list.
     * @public
     *
     * @param {number} xValue
     */
    removePointAtX: function( xValue ) {
      const indexOfValue = this.xPoints.indexOf( xValue );
      assert && assert( indexOfValue >= 0, 'value is not plotted and cannot be removed' );

      // just used for sanity checks
      const lengthBeforeRemoval = this.xPoints.length;

      this.xPoints = this.xPoints.concat( this.xPoints.splice( indexOfValue, 1 ) );
      this.yPoints = this.yPoints.concat( this.yPoints.splice( indexOfValue, 1 ) );
      this.pointStyles = this.pointStyles.concat( this.pointStyles.splice( indexOfValue, 1 ) );

      this.dataSeriesLength--;

      // sanity checks
      assert && assert( this.xPoints.length === this.yPoints.length, 'x and y data should be of the same length' );
      assert && assert( this.xPoints.length === lengthBeforeRemoval, 'data arrays should not change size during point removal' );
      assert && assert( this.dataSeriesLength >= 0, 'length should never be non-zero' );

      this.notifyListeners( this.dataSeriesLength );
    },

    clear: function() {
      this.dataSeriesLength = 0;
      this.cleared.emit();
    },

    getX: function( index ) {
      if ( index > this.dataSeriesLength - 1 ) {
        throw new Error( 'No Data Point Exist at this index ' + index );
      }
      return this.xPoints[ index ];
    },

    getY: function( index ) {
      if ( index > this.dataSeriesLength - 1 ) {
        throw new Error( 'No Data Point Exist at this index ' + index );
      }
      return this.yPoints[ index ];
    },

    /**
     * Get the point style for an individual data point. PointStyle fields are public and mutable so you can set
     * PointStyle properties without creating a new PointStyle. Setting a PointStyle field will trigger any redraw.
     *
     * @param {number} index
     * @returns {PointStyle}
     */
    getPointStyle: function( index ) {
      if ( index > this.dataSeriesLength - 1 ) {
        throw new Error( 'No Data Point Exist at this index ' + index );
      }
      return this.pointStyles[ index ];
    },

    /**
     * Set the style for an individual point. This DOES NOT trigger a redraw of the XYDataSeriesNode, so this won't
     * show up until next redraw.
     *
     * @param {number} index
     * @param {PointStyle|null} pointStyle
     */
    setPointStyle: function( index, pointStyle ) {
      assert && assert( pointStyle instanceof PointStyle, 'must use PointStyle' );
      if ( index > this.dataSeriesLength - 1 ) {
        throw new Error( 'No Data Point Exist at this index ' + index );
      }

      this.pointStyles[ index ] = pointStyle;
    },

    /**
     * @public - getter for the length.  DON'T CHANGE THIS TO AN ES5 GETTER.  That's what is was originally, and it
     * caused poor performance on iPad, see https://github.com/phetsims/neuron/issues/55.
     */
    getLength: function() {
      return this.dataSeriesLength;
    },

    /**
     * @public - getter for all the x points
     */
    getXPoints: function() {
      return this.xPoints;
    },

    /**
     * @public - getter for all the x points
     */
    getYPoints: function() {
      return this.yPoints;
    },

    /**
     * Get the list of point styles
     * @public
     *
     * @returns {Array.<PointStyle>}
     */
    getPointStyles: function() {
      return this.pointStyles;
    }

  } );
} );