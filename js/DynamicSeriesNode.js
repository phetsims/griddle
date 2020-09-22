// Copyright 2019-2020, University of Colorado Boulder

/**
 * This class renders DynamicSeries data in a XYPlotNode and is tightly coupled with XYPlotNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg
 */

import Enumeration from '../../phet-core/js/Enumeration.js';
import merge from '../../phet-core/js/merge.js';
import CanvasNode from '../../scenery/js/nodes/CanvasNode.js';
import Color from '../../scenery/js/util/Color.js';
import griddle from './griddle.js';

// constants
const PlotStyle = Enumeration.byKeys( [ 'SCATTER', 'LINE' ] );

class DynamicSeriesNode extends CanvasNode {

  /**
   * @param {DynamicSeries} dynamicSeries - the series of data to render
   * @param {number} plotWidth - the horizontal size of the plot, up to the center of the pen
   * @param {Bounds2} bounds - bounds for rendering, includes area to the right of the pens
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {Object} [options]
   */
  constructor( dynamicSeries, plotWidth, bounds, modelViewTransformProperty, options ) {

    options = merge( {

      // {PlotStyle} - changes how the dynamicSeries is drawn
      plotStyle: PlotStyle.LINE
    }, options );
    assert && assert( PlotStyle.includes( options.plotStyle ) );
    assert && assert( options.canvasBounds === undefined, 'DynamicSeriesNode sets bounds through constructor param' );

    super( {
      canvasBounds: bounds
    } );

    // @private
    this.modelViewTransformProperty = modelViewTransformProperty;
    this.plotStyle = options.plotStyle;
    this.dynamicSeries = dynamicSeries;

    // set visible with Property, handle saved for disposal
    const visibilityListener = dynamicSeries.visibleProperty.linkAttribute( this, 'visible' );

    // redraw data
    const dynamicSeriesListener = () => {
      this.invalidatePaint();
    };
    dynamicSeries.addDynamicSeriesListener( dynamicSeriesListener );
    modelViewTransformProperty.link( dynamicSeriesListener );
    dynamicSeries.visibleProperty.link( dynamicSeriesListener );
    this.disposeDynamicSeriesNode = () => {
      dynamicSeries.removeDynamicSeriesListener( dynamicSeriesListener );
      dynamicSeries.visibleProperty.unlink( visibilityListener );
      dynamicSeries.visibleProperty.unlink( dynamicSeriesListener );
      modelViewTransformProperty.unlink( dynamicSeriesListener );
    };
  }

  /**
   * Used to redraw the CanvasNode. Use CanvasNode.invalidatePaint to signify that
   * it is time to redraw the canvas.
   * @protected
   * @override
   *
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context ) {
    if ( this.dynamicSeries.visibleProperty.get() ) {
      if ( this.plotStyle === PlotStyle.LINE ) {
        this.drawDataLine( context );
      }
      else {
        this.drawDataScatter( context );
      }
    }
  }

  /**
   * Draw the DynamicSeries data as a scatter plot, each circular dot looks the same.
   * @private
   *
   * @param {CanvasRenderingContext2D} context
   */
  drawDataScatter( context ) {

    const contextColor = this.dynamicSeries.color instanceof Color ? this.dynamicSeries.color.toCSS() :
                         this.dynamicSeries.color;
    context.fillStyle = contextColor;

    // draw a circle at each data point
    for ( let i = 0; i < this.dynamicSeries.getLength(); i++ ) {
      context.beginPath();
      const viewPosition = this.modelViewTransformProperty.get().modelToViewPosition( this.dynamicSeries.getDataPoint( i ) );
      context.arc( viewPosition.x, viewPosition.y, this.dynamicSeries.radius, 0, 2 * Math.PI );
      context.fill();
    }
  }

  /**
   * Draw the DynamicSeries data as a continuous line.
   * @param {CanvasRenderingContext2D} context
   *
   * @private
   */
  drawDataLine( context ) {
    context.beginPath();

    const contextColor = this.dynamicSeries.color instanceof Color ? this.dynamicSeries.color.toCSS() :
                         this.dynamicSeries.color;
    context.strokeStyle = contextColor;
    context.lineWidth = this.dynamicSeries.lineWidth;
    context.lineJoin = this.dynamicSeries.lineJoin;

    let moveToNextPoint = true;
    const modelViewTransform = this.modelViewTransformProperty.get();

    for ( let i = 0; i < this.dynamicSeries.getLength(); i++ ) {
      const dataPoint = this.dynamicSeries.getDataPoint( i );

      if ( isNaN( dataPoint.y ) ) {
        moveToNextPoint = true;
      }
      else {
        const point = modelViewTransform.modelToViewPosition( dataPoint );
        if ( moveToNextPoint ) {
          context.moveTo( point.x, point.y );
        }
        else {
          context.lineTo( point.x, point.y );
        }

        moveToNextPoint = false;
      }
    }

    context.stroke();
  }

  /**
   * Set the plot style for the DynamicSeriesNode.
   * @public
   * @param {PlotStyle} plotStyle - value from of PlotStyle
   */
  setPlotStyle( plotStyle ) {
    assert && assert( PlotStyle.includes( plotStyle ) );

    // only update/redraw if there is a change in style
    if ( plotStyle !== this.plotStyle ) {
      this.plotStyle = plotStyle;
      this.invalidatePaint();
    }
  }

  /**
   * @public
   */
  dispose() {
    this.disposeDynamicSeriesNode();
    super.dispose();
  }
}

// @public (read-only)
DynamicSeriesNode.PlotStyle = PlotStyle;

griddle.register( 'DynamicSeriesNode', DynamicSeriesNode );
export default DynamicSeriesNode;