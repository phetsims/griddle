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
  const Color = require( 'SCENERY/util/Color' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const griddle = require( 'GRIDDLE/griddle' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const PlotStyle = new Enumeration( [ 'SCATTER', 'LINE' ] );

  // to avoid instantiating numerous Colors
  const scratchColor = new Color( 'black' );

  /**
   * @param {XYDataSeries} xyDataSeries
   * @param {Bounds2} plotBounds
   * @param {Range} yRange - in "model" coordinates for the plotted data
   * @param {Object} [options]
   * @constructor
   */
  function XYDataSeriesNode( xyDataSeries, plotBounds, yRange, options ) {

    var self = this;
    options = _.extend( {

      // If true, XYDataSeries values will be scaled by xScaleFactor and yScaleFactor before drawing to the view. this
      // is generally used if the XYDataSeries is in the coordinate plot domain and range specified by XYPlot minX,
      // maxX, minY, maxY. But if your data is relative another coordinate frame (like view coordinates), this can
      // be set to false
      useScaleFactors: true,

      // {string} - one of PlotStyle, 'line' will display data as a continuous line while 'scatter' will display
      // data as discrete points
      plotStyle: PlotStyle.LINE
    }, options );

    assert && assert( PlotStyle.includes( options.plotStyle ), 'plotStyle must be one of STYLE_OPTIONS' );

    // @private {XYDataSeries} - the data for this node to be plotted
    this.xyDataSeries = xyDataSeries;

    // @private {Bounds2} - the bounds for the plot for positioning drawn data points, excludes labels
    this.plotBounds = plotBounds;

    // @private {boolean} - see options.useScaleFactors for when this may be set to false
    this.useScaleFactors = options.useScaleFactors;

    // @private {number} - scale factors to assist in determining where points should be positioned relative to
    // plotBounds
    this.xScaleFactor = 1;
    this.yScaleFactor = 1;

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
     * Set the scale factor for the x coordinates - before drawing, x points in the XYDataSeries will be multiplied by
     * this factor.
     * 
     * @param {number} scaleFactor
     */
    setXScaleFactor( scaleFactor ) {
      this.xScaleFactor = scaleFactor;
    },

    /**
     * Set the scale factor for the y coordinates - before drawing, y points in the XYDataSeries will by multiplied
     * by this factor.
     * 
     * @param {} scaleFactor
     */
    setYScaleFactor( scaleFactor ) {
      this.yScaleFactor = scaleFactor;
    },

    /**
     *
     * @param {*} plotStyle - value from of PlotStyle
     */
    setPlotStyle( plotStyle ) {
      assert && assert( PlotStyle.includes( plotStyle ) );
      this.plotStyle = plotStyle;
      this.invalidatePaint();
    },

    /**
     * make eligible for garbage collection
     */
    dispose: function() {
      this.disposeXYDataSeriesNode();
      CanvasNode.prototype.dispose.call( this );
    },

    /**
     * Redraw the node, calling invalidatePaint to ensure that Scenery will redraw the canvas when it can.
     * @public
     */
    redraw: function() {
      this.invalidatePaint();
    },

    /**
     * paint the data series on the canvas, generally only called from the Scenery framework
     * @param {CanvasRenderingContext2D} context
     * @public
     */
    paintCanvas: function( context ) {

      var xPoints = this.xyDataSeries.getXPoints();
      var yPoints = this.xyDataSeries.getYPoints();
      var pointStyles = this.xyDataSeries.getPointStyles();
      var dataPointsLength = this.xyDataSeries.getLength();

      if ( dataPointsLength > 0 ) {
        if ( this.plotStyle === PlotStyle.LINE ) {
          this.drawDataLine( context, xPoints, yPoints, dataPointsLength ); 
        }
        else if ( this.plotStyle === PlotStyle.SCATTER ) {
          this.drawDataScatter( context, xPoints, yPoints, pointStyles, dataPointsLength );
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
        const xScaleFactor = this.useScaleFactors ? this.xScaleFactor : 1;
        const yScaleFactor = this.useScaleFactors ? this.yScaleFactor : 1;

        const xPos = xPoints[ i ] * xScaleFactor;
        const yPos = yPoints[ i ] * yScaleFactor - this.yPointOffset;

        // only render points that are on the graph
        if ( this.plotBounds.containsCoordinates( xPos, yPos ) ) {
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
     * @param {Array.<PointStyle|null>} pointStyles [description]
     * @param {number} dataPointsLength
     */
    drawDataScatter( context, xPoints, yPoints, pointStyles, dataPointsLength ) {
      for ( var i = 0; i < dataPointsLength; i++ ) {
        const xScaleFactor = this.useScaleFactors ? this.xScaleFactor : 1;
        const yScaleFactor = this.useScaleFactors ? this.yScaleFactor : 1;

        const xPos = xPoints[ i ] * xScaleFactor;
        const yPos = yPoints[ i ] * yScaleFactor - this.yPointOffset;

        // only render points that are on the graph
        if ( this.plotBounds.containsCoordinates( xPos, yPos ) ) {
          scratchColor.set( this.xyDataSeries.color );

          const opacity = 1;
          let radius = this.xyDataSeries.radius;
          let visible = true;
          let lineWidth = this.xyDataSeries.lineWidth;
          let strokeStyle = null;

          const pointStyle = pointStyles[ i ];
          if ( pointStyle ) {
            scratchColor.alpha = pointStyle.opacity || opacity;
            radius = pointStyle.radius || radius;
            visible = ( typeof pointStyle.visible === 'boolean' ) ? pointStyle.visible : visible;
            lineWidth = pointStyle.lineWidth || lineWidth;
            strokeStyle = pointStyle.strokeStyle || strokeStyle;
          }
          context.fillStyle = scratchColor.computeCSS();

          if ( visible ) {
            context.beginPath();
            context.arc( xPos, yPos, radius, 0, 2 * Math.PI, false);
            context.fill();

            if ( strokeStyle ) {
              context.strokeStyle = strokeStyle;
              context.lineWidth = lineWidth;
              context.stroke();
            }
          }
        }
      }
    }
  }, {

    // @public (read-only)
    PlotStyle: PlotStyle
  } );
} );