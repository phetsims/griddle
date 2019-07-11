// Copyright 2019, University of Colorado Boulder

/**
 * This class renders DynamicSeries data in a ScrollingChartNode and is tightly coupled with ScrollingChartNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const griddle = require( 'GRIDDLE/griddle' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );

  class DynamicSeriesNode extends Node {

    /**
     * @param {DynamicSeries} dynamicSeries - the series of data to render
     * @param {number} plotWidth - the horizontal size of the plot, up to the center of the pen
     * @param {Bounds2} bounds - bounds for rendering, includes area to the right of the pens
     * @param {number} maxTime - Set the range by incorporating the model's time units, so it will match with the timer.
     * @param {Property.<number>} timeProperty
     */
    constructor( dynamicSeries, plotWidth, bounds, maxTime, timeProperty ) {

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
        for ( let i = 0; i < dynamicSeries.data.length; i++ ) {
          const dataPoint = dynamicSeries.data[ i ];
          if ( isNaN( dataPoint.y ) ) {
            moveToNextPoint = true;

            // Center the pen when data is NaN
            penNode.centerY = Util.linear( 0, 2, bounds.height / 2, 0, 0 );
          }
          else {
            const scaledValue = Util.linear( 0, 2, bounds.height / 2, 0, dataPoint.y );

            const time = Util.linear( timeProperty.value, timeProperty.value - maxTime, plotWidth, 0, dataPoint.x );
            if ( moveToNextPoint ) {
              dynamicSeriesPathShape.moveTo( time, scaledValue );
            }
            else {
              dynamicSeriesPathShape.lineTo( time, scaledValue );
            }

            if ( i === dynamicSeries.data.length - 1 ) {
              penNode.centerY = scaledValue;
            }
            moveToNextPoint = false;
          }
        }
        pathNode.shape = dynamicSeriesPathShape;
      };
      dynamicSeries.emitter.addListener( dynamicSeriesListener );
      this.disposeDynamicSeriesNode = () => {
        dynamicSeries.emitter.removeListener( dynamicSeriesListener );
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

  return griddle.register( 'DynamicSeriesNode', DynamicSeriesNode );
} );