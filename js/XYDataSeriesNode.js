// Copyright 2014-2020, University of Colorado Boulder

/**
 * Node that depicts an DynamicSeries as a line or scatterplot on a canvas, created internally by XYPlot.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author Aadish Gupta (PhET Interactive Simulations)
 */

import Enumeration from '../../phet-core/js/Enumeration.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import CanvasNode from '../../scenery/js/nodes/CanvasNode.js';
import Color from '../../scenery/js/util/Color.js';
import griddle from './griddle.js';

// constants
const PlotStyle = Enumeration.byKeys( [ 'SCATTER', 'LINE' ] );

// to avoid instantiating numerous Colors
const scratchColor = new Color( 'black' );

/**
 * @param {DynamicSeries} xyDataSeries
 * @param {Bounds2} plotBounds
 * @param {Range} yRange - in "model" coordinates for the plotted data
 * @param {Object} [options]
 * @constructor
 */
function XYDataSeriesNode( xyDataSeries, plotBounds, yRange, options ) {

  const self = this;
  options = merge( {

    // If true, DynamicSeries values will be scaled by xScaleFactor and yScaleFactor before drawing to the view. this
    // is generally used if the DynamicSeries is in the coordinate plot domain and range specified by XYPlot minX,
    // maxX, minY, maxY. But if your data is relative another coordinate frame (like view coordinates), this can
    // be set to false
    useScaleFactors: true,

    // {string} - one of PlotStyle, 'line' will display data as a continuous line while 'scatter' will display
    // data as discrete points
    plotStyle: PlotStyle.LINE
  }, options );

  assert && assert( PlotStyle.includes( options.plotStyle ), 'plotStyle must be one of STYLE_OPTIONS' );

  // @public {DynamicSeries} - the data for this node to be plotted
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

  const listener = () => self.invalidatePaint();
  xyDataSeries.addDynamicSeriesListener( listener );

  // @private
  this.disposeXYDataSeriesNode = () => xyDataSeries.removeDynamicSeriesListener( listener );
}

griddle.register( 'XYDataSeriesNode', XYDataSeriesNode );

export default inherit( CanvasNode, XYDataSeriesNode, {

  /**
   * Set the scale factor for the x coordinates - before drawing, x points in the DynamicSeries will be multiplied by
   * this factor.
   *
   * @param {number} scaleFactor
   */
  setXScaleFactor( scaleFactor ) {
    this.xScaleFactor = scaleFactor;
  },

  /**
   * Set the scale factor for the y coordinates - before drawing, y points in the DynamicSeries will by multiplied
   * by this factor.
   *
   * @param {} scaleFactor
   */
  setYScaleFactor( scaleFactor ) {
    this.yScaleFactor = scaleFactor;
  },

  /**
   * @param {PlotStyle} plotStyle - value from of PlotStyle
   */
  setPlotStyle( plotStyle ) {
    assert && assert( PlotStyle.includes( plotStyle ) );
    this.plotStyle = plotStyle;
    this.invalidatePaint();
  },

  /**
   * make eligible for garbage collection
   */
  dispose() {
    this.disposeXYDataSeriesNode();
    CanvasNode.prototype.dispose.call( this );
  },

  /**
   * paint the data series on the canvas, generally only called from the Scenery framework
   * @param {CanvasRenderingContext2D} context
   * @public
   */
  paintCanvas( context ) {
    if ( this.plotStyle === PlotStyle.LINE ) {
      this.drawDataLine( context, this.xyDataSeries );
    }
    else if ( this.plotStyle === PlotStyle.SCATTER ) {
      this.drawDataScatter( context, this.xyDataSeries );
    }
  },

  /**
   * Draw the data as a continuous line over all points in the DynamicSeries.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {DynamicSeries} dynamicSeries
   */
  drawDataLine( context, dynamicSeries ) {
    let previousPointOnGraph = false;
    context.beginPath();

    // draw the line by connecting all of the points in the data set
    for ( let i = 0; i < dynamicSeries.getLength(); i++ ) {
      const xScaleFactor = this.useScaleFactors ? this.xScaleFactor : 1;
      const yScaleFactor = this.useScaleFactors ? this.yScaleFactor : 1;

      const xPos = dynamicSeries.getDataPoint( i ).x * xScaleFactor;
      const yPos = dynamicSeries.getDataPoint( i ).y * yScaleFactor - this.yPointOffset;

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
   * Draw the DynamicSeries as a scatter plot.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {DynamicSeries} dynamicSeries
   */
  drawDataScatter( context, dynamicSeries ) {
    for ( let i = 0; i < dynamicSeries.getLength(); i++ ) {
      const xScaleFactor = this.useScaleFactors ? this.xScaleFactor : 1;
      const yScaleFactor = this.useScaleFactors ? this.yScaleFactor : 1;

      const xPos = dynamicSeries.getDataPoint( i ).x * xScaleFactor;
      const yPos = dynamicSeries.getDataPoint( i ).y * yScaleFactor - this.yPointOffset;

      // only render points that are on the graph
      if ( this.plotBounds.containsCoordinates( xPos, yPos ) ) {
        scratchColor.set( this.xyDataSeries.color );

        const opacity = 1;
        let radius = this.xyDataSeries.radius;
        let visible = true;
        let lineWidth = this.xyDataSeries.lineWidth;
        let strokeStyle = null;

        const pointStyle = dynamicSeries.getDataPoint( i ).pointStyle;
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
          context.arc( xPos, yPos, radius, 0, 2 * Math.PI, false );
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