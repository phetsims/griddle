// Copyright 2002-2014, University of Colorado Boulder

/**
 * XY Data Series
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Panel = require( 'SUN/Panel' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Range = require( 'DOT/Range' );

  function XYDataSeries( options ) {

    this.options = _.extend( {
      color: 'black'
    }, options );

    this.color = this.options.color;

    this.listeners = [];

    //todo: preallocate?  Or use Array[Vector2] that is preallocated?
    this.xPoints = [];
    this.yPoints = [];
  }

  return inherit( Panel, XYDataSeries, {
    addDataSeriesListener: function( listener ) {
      this.listeners.push( listener );
    },
    addPoint: function( x, y ) {
      this.xPoints.push( x );
      this.yPoints.push( y );
      for ( var i = 0; i < this.listeners.length; i++ ) {
        this.listeners[i]( x, y, this.xPoints[this.xPoints.length - 2], this.yPoints[this.yPoints.length - 2] );
      }
    }

  } );
} );