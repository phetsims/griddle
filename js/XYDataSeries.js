// Copyright 2002-2014, University of Colorado Boulder

/**
 * XY Data Series
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Events = require( 'AXON/Events' );

  function XYDataSeries( options ) {

    this.options = _.extend( {
      color: 'black'
    }, options );

    this.color = this.options.color;

    this.listeners = [];

    //todo: preallocate?  Or use Array[Vector2] that is preallocated?
    this.xPoints = [];
    this.yPoints = [];

    Events.call( this );
  }

  return inherit( Events, XYDataSeries, {
    addDataSeriesListener: function( listener ) {
      this.listeners.push( listener );
    },
    removeDataSeriesListener: function( listener ) {
      var index = this.listeners.indexOf( listener );
      if ( index !== -1 ) {
        this.listeners.splice( index, 1 );
      }
    },
    addPoint: function( x, y ) {
      this.xPoints.push( x );
      this.yPoints.push( y );
      for ( var i = 0; i < this.listeners.length; i++ ) {
        this.listeners[ i ]( x, y, this.xPoints[ this.xPoints.length - 2 ], this.yPoints[ this.yPoints.length - 2 ] );
      }
    },
    clear: function() {
      this.xPoints = [];
      this.yPoints = [];
      this.trigger( 'cleared' );
    },

    getX: function( index ) {
      if ( index > this.xPoints.length - 1 ) {
        throw new Error( "No Data Point Exist at this index " + index );
      }
      return this.xPoints[ index ];

    },

    /**
     *
     * @param {array[array, array]} vectorArray
     */
    setPoints: function(vectorArray) {
      this.clear();
      var xarr = vectorArray[0];
      var yarr = vectorArray[1];
      for (var j=0; j < xarr.length; j++) {
          this.addPoint(xarr[j], yarr[j]);
      }
    },

    /**
     *
     * @param {int} start
     * @param {int} stop
     */
    genRange: function(start, stop) {
        /*
         * Yield a range of integer values, [lower, upper)
         */
        return Array.apply(null, Array(stop - start)).map(function (_, i) {return start + i;})
    },

    /**
     *
     * @param {callable} func
     * @param {array[int, int]} func
     */
    applyFunction: function(func, domain) {
        domainValues = genRange(domain[0], domain[1]);
        rangeValues = domainValues.map(func);
        this.setPoints([domainValues, rangeValues]);
    },

    get length() {
      return this.xPoints.length;
    }
  } );
} );
