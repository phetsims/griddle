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

    get length() {
      return this.xPoints.length;
    }
  } );
} );