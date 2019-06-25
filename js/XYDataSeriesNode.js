// Copyright 2014-2019, University of Colorado Boulder

/**
 * Node that depicts an XYDataSeries as a line on a canvas. There is no reason to create this outside of griddle,
 * it is created internally by XYPlot.
 * 
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author Aadish Gupta
 */
define( function( require ) {
  'use strict';

  // modules
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const griddle = require( 'GRIDDLE/griddle' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const PlotStyle = new Enumeration( [ 'SCATTER', 'LINE' ] );

  /**
   * 
   * 
   * @param {XYDataSeries} xyDataSeries
   * @param {Bounds2} plotBounds
   * @param {Range} yRange - in "model" coordinates for the plotted data
   * @param {Object} [options]
   * @constructor
   */
  function XYDataSeriesNode( xyDataSeries, plotBounds, yRange, options ) {

    var self = this;
    options = _.extend( {
      xScaleFactor: 1,
      yScaleFactor: 1,

      // {string} - one of PlotStyle, 'line' will display data as a continuous line while 'scatter' will display
      // data as discrete points
      plotStyle: PlotStyle.LINE
    }, options );

    assert && assert( PlotStyle.includes( options.plotStyle ), 'plotStyle must be one of STYLE_OPTIONS' );

    this.xyDataSeries = xyDataSeries;
    this.bound = plotBounds;
    this.xScaleFactor = options.xScaleFactor;
    this.yScaleFactor = options.yScaleFactor;

    // @private {string} - one of STYLE_OPTIONS, see options for documentation
    this.plotStyle = options.plotStyle;

    // @private - Offset for drawing y data points since the plot may not be drawn
    // with y=0 at the bottom. This is in "view" coordinates relative to the plotBounds
    this.yPointOffset = plotBounds.height * ( -yRange.min ) / yRange.getLength();

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
    this.previousPoint = new Vector2( 0, 0 );
    this.currentPoint = new Vector2( 0, 0 );

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

        if ( this.plotStyle === PlotStyle.LINE ) {
          this.drawDataLine( context, xPoints, yPoints, dataPointsLength ); 
        }
        else if ( this.plotStyle === PlotStyle.SCATTER ) {
          this.drawDataScatter( context, xPoints, yPoints, dataPointsLength );
        }
        else if ( assert ) {
          throw new Error( 'Cannot draw plot for ' + this.plotStyle + 'plot style' );
        }
      }
    },

    /**
     * Draw the data as a continuous line over all points in the XYDataSeries.
     * 
     * @param {CanvasRenderingContext2D}
     * @param {Array.<number>} xPoints
     * @param {Array.<number>} yPoints
     * @param {number} dataPointsLength
     */
    drawDataLine( context, xPoints, yPoints, dataPointsLength ) {
      var previousPointOnGraph = false;
      context.beginPath();

      // draw the line by connecting all of the points in the data set
      for ( var i = 0; i < dataPointsLength; i++ ) {

        var xPos = xPoints[ i ] * this.xScaleFactor;
        var yPos = yPoints[ i ] * this.yScaleFactor - this.yPointOffset;

        // only render points that are on the graph
        if ( this.bound.containsCoordinates( xPos, yPos ) ) {
          if ( previousPointOnGraph ) {
            context.lineTo( xPos, yPos );
          }
          else {
            context.moveTo( xPos, yPos );
          }
          previousPointOnGraph = true;
        }
        else {
          previousPointOnGraph = false;
        }
      }

      // stroke the line
      context.setLineDash( [] );
      context.lineJoin = 'round';
      context.strokeStyle = this.xyDataSeries.color.computeCSS();
      context.lineWidth = this.xyDataSeries.lineWidth;
      context.stroke();
    },

    /**
     * Draw the XYDataSeries as a scatter plot.
     *
     * @param {CanvasRenderingContext2D}
     * @param {Array.<number>} xPoints
     * @param {Array.<number>} yPoints
     * @param {number} dataPointsLength
     */
    drawDataScatter( context, xPoints, yPoints, dataPointsLength ) {
      context.fillStyle = this.xyDataSeries.color.computeCSS();

      for ( var i = 0; i < dataPointsLength; i++ ) {

        var xPos = xPoints[ i ] * this.xScaleFactor;
        var yPos = yPoints[ i ] * this.yScaleFactor - this.yPointOffset;

        // only render points that are on the graph
        if ( this.bound.containsCoordinates( xPos, yPos ) ) {
          context.beginPath();
          context.arc( xPos, yPos, 2, 0, 2 * Math.PI, false);
          context.fill();
        }
      }
    }
  }, {

    // @public (read-only)
    PlotStyle: PlotStyle
  } );
} );