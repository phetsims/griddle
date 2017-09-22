// Copyright 2014-2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author Aadish Gupta
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param {XYDataSeries} xyDataSeries
   * @param {Bounds2} plotBounds
   * @param {Object} [options]
   * @constructor
   */
  function XYDataSeriesNode( xyDataSeries, plotBounds, options ) {

    var self = this;
    options = _.extend( {
      xScaleFactor: 1,
      yScaleFactor: 1
    }, options );

    this.xyDataSeries = xyDataSeries;
    this.bound = plotBounds;
    this.xScaleFactor = options.xScaleFactor;
    this.yScaleFactor = options.yScaleFactor;
    CanvasNode.call( this, options );

    self.setCanvasBounds( plotBounds );

    var listener = function() {
      self.invalidatePaint();
    };

    var clearListener = function() {
      self.invalidatePaint();
    };
    xyDataSeries.addDataSeriesListener( listener );
    xyDataSeries.cleared.addListener( clearListener );

    /**
     * @public
     */
    this.disposeXYDataSeriesNode = function() {
      xyDataSeries.removeDataSeriesListener( listener );
      xyDataSeries.cleared.removeListener( clearListener );
    };
  }

  griddle.register( 'XYDataSeriesNode', XYDataSeriesNode );

  return inherit( CanvasNode, XYDataSeriesNode, {

    /**
     * Make eligible for garbage collection.
     */
    dispose: function() {
      this.disposeXYDataSeriesNode();
      CanvasNode.prototype.dispose.call( this );
    },

    paintCanvas: function( context ) {

      var xPoints = this.xyDataSeries.getXPoints();
      var yPoints = this.xyDataSeries.getYPoints();
      var dataPointsLength = this.xyDataSeries.getLength();
      if ( dataPointsLength > 0 ) {
        context.beginPath();
        for ( var i = 1; i < dataPointsLength; i++ ) {
          // make sure current x and y are in the range before plotting them
          if ( this.bound.containsCoordinates( xPoints[ i ] * this.xScaleFactor, yPoints[ i ] * this.yScaleFactor ) &&
               this.bound.containsCoordinates( xPoints[ i - 1 ] * this.xScaleFactor, yPoints[ i - 1 ] * this.yScaleFactor ) ) {
            context.moveTo( xPoints[ i - 1 ] * this.xScaleFactor, yPoints[ i - 1 ] * this.yScaleFactor );
            context.lineTo( xPoints[ i ] * this.xScaleFactor, yPoints[ i ] * this.yScaleFactor );
          }
        }

        context.strokeStyle = this.xyDataSeries.color.computeCSS();
        context.lineWidth = this.xyDataSeries.lineWidth;
        context.stroke();
      }

    }

  } );
} );