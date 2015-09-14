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

    options = _.extend( {
      color: 'black',
      maxPoints: 1000
    }, options );

    this.color = options.color; // @public
    this.maxPoints = options.maxPoints; // @private
    this.listeners = []; // @private

    //this.xPoints = [];
    this.xPoints = new Array( options.maxPoints ); // @private
    //this.yPoints = [];
    this.yPoints = new Array( options.maxPoints ); // @private

    this.dataSeriesLength = 0; // @private, index to next available slot

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

      // store the data
      this.xPoints[ this.dataSeriesLength ] = x;
      this.yPoints[ this.dataSeriesLength ] = y;

      // notify listeners - note that the previous data series values can be undefined in the notification
      for ( var i = 0; i < this.listeners.length; i++ ) {
        this.listeners[ i ]( x, y, this.xPoints[ this.dataSeriesLength ], this.yPoints[ this.dataSeriesLength ] );
      }

      // point to the next slot
      this.dataSeriesLength++;
      assert && assert( this.dataSeriesLength < this.maxPoints, 'Capacity of data series exceeded' );
    },

    clear: function() {
      this.dataSeriesLength = 0;
      this.trigger( 'cleared' );
    },

    getX: function( index ) {
      if ( index > this.dataSeriesLength - 1 ) {
        throw new Error( "No Data Point Exist at this index " + index );
      }
      return this.xPoints[ index ];
    },

    /**
     * @public - getter for the length.  DON'T CHANGE THIS TO AN ES5 GETTER.  That's what is was originally, and it
     * caused poor performance on iPad, see https://github.com/phetsims/neuron/issues/55.
     */
    getLength: function() {
      return this.dataSeriesLength;
    }
  } );
} );