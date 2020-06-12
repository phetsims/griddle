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

class DynamicSeriesNode extends Node {

  /**
   * @param {DynamicSeries} dynamicSeries - the series of data to render
   * @param {number} plotWidth - the horizontal size of the plot, up to the center of the pen
   * @param {Bounds2} bounds - bounds for rendering, includes area to the right of the pens
   * @param {number} maxTime - Set the range by incorporating the model's time units, so it will match with the timer.
   * @param {Property.<number>} timeProperty
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   */
  constructor( dynamicSeries, plotWidth, bounds, maxTime, timeProperty, modelViewTransformProperty ) {

    // For the initial point or when there has been NaN data, the next call should be moveTo() instead of lineTo()
    let moveToNextPoint = true;

    const pathNode = new Path( new Shape(), {
      stroke: dynamicSeries.color,
      lineWidth: dynamicSeries.lineWidth
    } );

    super( {
      children: [ pathNode ]
    } );

    // prevent bounds computations during main loop
    pathNode.computeShapeBounds = () => bounds;

    const dynamicSeriesListener = () => {
      const modelViewTransform = modelViewTransformProperty.get();

      // Draw the graph with line segments
      const dynamicSeriesPathShape = new Shape();
      for ( let i = 0; i < dynamicSeries.getLength(); i++ ) {
        const dataPoint = dynamicSeries.getDataPoint( i );
        if ( isNaN( dataPoint.y ) ) {
          moveToNextPoint = true;
        }
        else {
          const point = modelViewTransform.modelToViewPosition( dataPoint );
          if ( moveToNextPoint ) {
            dynamicSeriesPathShape.moveToPoint( point );
          }
          else {
            dynamicSeriesPathShape.lineToPoint( point );
          }

          moveToNextPoint = false;
        }
      }
      pathNode.shape = dynamicSeriesPathShape;
    };
    dynamicSeries.addDynamicSeriesListener( dynamicSeriesListener );
    modelViewTransformProperty.link( dynamicSeriesListener );
    this.disposeDynamicSeriesNode = () => {
      dynamicSeries.removeDynamicSeriesListener( dynamicSeriesListener );
      modelViewTransformProperty.unlink( dynamicSeriesListener );
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeDynamicSeriesNode();
    super.dispose();
  }
}

griddle.register( 'DynamicSeriesNode', DynamicSeriesNode );
export default DynamicSeriesNode;