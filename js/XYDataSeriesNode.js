// Copyright 2014-2017, University of Colorado Boulder

/**
 * node that depicts an XYDataSeries as a line on a canvas
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
  var Vector2 = require( 'DOT/Vector2' );

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

    // reusable vectors for optimal performace
    this.previousPoint = new Vector2();
    this.currentPoint = new Vector2();

    /**
     * @private
     */
    this.disposeXYDataSeriesNode = function() {
      xyDataSeries.removeDataSeriesListener( listener );
      xyDataSeries.cleared.removeListener( clearListener );
    };
  }

  griddle.register( 'XYDataSeriesNode', XYDataSeriesNode );

  return inherit( CanvasNode, XYDataSeriesNode, {

    /**
     * make eligible for garbage collection
     */
    dispose: function() {
      this.disposeXYDataSeriesNode();
      CanvasNode.prototype.dispose.call( this );
    },

    /**
     * paint the data series on the canvas, generally only called from the Scenery framework
     * @param {CanvasRenderingContext2D} context
     * @public
     */
    paintCanvas: function( context ) {

      var xPoints = this.xyDataSeries.getXPoints();
      var yPoints = this.xyDataSeries.getYPoints();
      var dataPointsLength = this.xyDataSeries.getLength();

      if ( dataPointsLength > 0 ) {

        var previousPointOnGraph = false;
        context.beginPath();

        // draw the line by connecting all of the points in the data set
        for ( var i = 0; i < dataPointsLength; i++ ) {

          var xPos = xPoints[ i ] * this.xScaleFactor;
          var yPos = yPoints[ i ] * this.yScaleFactor;

          // only render points that are on the graph
          if ( this.bound.containsCoordinates( xPos, yPos ) ){
            if ( previousPointOnGraph ){
              context.lineTo( xPos, yPos );
            }
            else{
              context.moveTo( xPos, yPos );
            }
            previousPointOnGraph = true;
          }
          else{
            previousPointOnGraph = false;
          }
        }

        // stroke the line
        context.setLineDash([]);
        context.lineJoin = 'round';
        context.strokeStyle = this.xyDataSeries.color.computeCSS();
        context.lineWidth = this.xyDataSeries.lineWidth;
        context.stroke();
      }
    }
  } );
} );