// Copyright 2019-2020, University of Colorado Boulder

/**
 * This class renders DynamicSeries data in a ScrollingChartNode and is tightly coupled with ScrollingChartNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../kite/js/Shape.js';
import Circle from '../../scenery/js/nodes/Circle.js';
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
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( dynamicSeries, plotWidth, bounds, maxTime, timeProperty, modelViewTransform ) {

    // For the initial point or when there has been NaN data, the next call should be moveTo() instead of lineTo()
    let moveToNextPoint = true;

    // Create the pen which draws the data at the right side of the graph
    const penNode = new Circle( 4.5, {
      fill: dynamicSeries.color,
      centerX: plotWidth,
      centerY: bounds.height / 2
    } );
    const pathNode = new Path( new Shape(), {
      stroke: dynamicSeries.color,
      lineWidth: dynamicSeries.lineWidth
    } );

    super( {
      children: [ penNode, pathNode ]
    } );

    // prevent bounds computations during main loop
    pathNode.computeShapeBounds = () => bounds;

    const dynamicSeriesListener = () => {

      // Draw the graph with line segments
      const dynamicSeriesPathShape = new Shape();
      for ( let i = 0; i < dynamicSeries.getLength(); i++ ) {
        const dataPoint = dynamicSeries.getDataPoint( i );
        if ( isNaN( dataPoint.y ) ) {
          moveToNextPoint = true;

          // Center the pen when data is NaN
          penNode.centerY = modelViewTransform.modelToViewY( 0 );
        }
        else {
          const point = modelViewTransform.modelToViewPosition( dataPoint );
          if ( moveToNextPoint ) {
            dynamicSeriesPathShape.moveToPoint( point );
          }
          else {
            dynamicSeriesPathShape.lineToPoint( point );
          }

          if ( i === dynamicSeries.getLength() - 1 ) {
            penNode.centerY = point.y;
          }
          moveToNextPoint = false;
        }
      }
      pathNode.shape = dynamicSeriesPathShape;
    };
    dynamicSeries.addDynamicSeriesListener( dynamicSeriesListener );
    modelViewTransform.changeEmitter.addListener( dynamicSeriesListener );
    this.disposeDynamicSeriesNode = () => {
      dynamicSeries.removeDynamicSeriesListener( dynamicSeriesListener );
      modelViewTransform.changeEmitter.removeListener( dynamicSeriesListener );
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