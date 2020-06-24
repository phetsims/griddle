// Copyright 2019-2020, University of Colorado Boulder

/**
 * This class renders DynamicSeries data in a ScrollingChartNode and is tightly coupled with ScrollingChartNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../kite/js/Shape.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import griddle from './griddle.js';
import merge from '../../phet-core/js/merge.js';
import Enumeration from '../../phet-core/js/Enumeration.js';

// constants
const PlotStyle = Enumeration.byKeys( [ 'SCATTER', 'LINE' ] );

class DynamicSeriesNode extends Node {

  /**
   * @param {DynamicSeries} dynamicSeries - the series of data to render
   * @param {number} plotWidth - the horizontal size of the plot, up to the center of the pen
   * @param {Bounds2} bounds - bounds for rendering, includes area to the right of the pens
   * @param {number} maxTime - Set the range by incorporating the model's time units, so it will match with the timer.
   * @param {Property.<number>} timeProperty
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {Object} [options]
   */
  constructor( dynamicSeries, plotWidth, bounds, maxTime, timeProperty, modelViewTransformProperty, options ) {

    options = merge( {

      // {PlotStyle} - changes how the dynamicSeries is drawn
      plotStyle: PlotStyle.LINE
    }, options );
    assert && assert( PlotStyle.includes( options.plotStyle ) );

    super();

    // @private {Path} - the Path node used to draw the shape of the data
    this.pathNode = new Path( new Shape(), {
      lineWidth: dynamicSeries.lineWidth
    } );
    this.addChild( this.pathNode );

    // @private
    this.modelViewTransformProperty = modelViewTransformProperty;
    this.plotStyle = options.plotStyle;
    this.dynamicSeries = dynamicSeries;

    // prevent bounds computations during main loop
    this.pathNode.computeShapeBounds = () => bounds;

    // redraw data
    const dynamicSeriesListener = () => {
      if ( this.plotStyle === PlotStyle.LINE ) {
        this.drawDataLine();
      }
      else {
        this.drawDataScatter();
      }
    };
    dynamicSeries.addDynamicSeriesListener( dynamicSeriesListener );
    modelViewTransformProperty.link( dynamicSeriesListener );
    this.disposeDynamicSeriesNode = () => {
      dynamicSeries.removeDynamicSeriesListener( dynamicSeriesListener );
      modelViewTransformProperty.unlink( dynamicSeriesListener );
    };
  }

  /**
   * Draw the DynamicSeries data as a scatter plot, each circular dot looks the same.
   * @private
   */
  drawDataScatter() {

    // One shape composed of multiple circles
    const dynamicSeriesPathShape = new Shape();
    for ( let i = 0; i < this.dynamicSeries.getLength(); i++ ) {
      const viewPosition = this.modelViewTransformProperty.get().modelToViewPosition( this.dynamicSeries.getDataPoint( i ) );
      dynamicSeriesPathShape.circle( viewPosition.x, viewPosition.y, this.dynamicSeries.radius ).newSubpath();
    }
    this.pathNode.shape = dynamicSeriesPathShape;
  }

  /**
   * Draw the DynamicSeries data as a continuous line.
   * @private
   */
  drawDataLine() {
    this.moveToNextPoint = true;

    // Draw the graph with line segments
    const dynamicSeriesPathShape = new Shape();
    for ( let i = 0; i < this.dynamicSeries.getLength(); i++ ) {
      const dataPoint = this.dynamicSeries.getDataPoint( i );
      if ( isNaN( dataPoint.y ) ) {
        this.moveToNextPoint = true;
      }
      else {
        const point = this.modelViewTransformProperty.get().modelToViewPosition( dataPoint );
        if ( this.moveToNextPoint ) {
          dynamicSeriesPathShape.moveToPoint( point );
        }
        else {
          dynamicSeriesPathShape.lineToPoint( point );
        }

        this.moveToNextPoint = false;
      }
    }
    this.pathNode.shape = dynamicSeriesPathShape;


    this.pathNode.fill = null;
    this.pathNode.stroke = this.dynamicSeries.color;
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

      if ( plotStyle === PlotStyle.LINE ) {
        this.drawDataLine( this.modelViewTransformProperty.get() );
      }
      else {
        this.drawDataScatter( this.modelViewTransformProperty.get() );
      }

      this.pathNode.fill = this.dynamicSeries.color;
      this.pathNode.stroke = null;
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