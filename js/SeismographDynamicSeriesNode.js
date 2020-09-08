// Copyright 2020, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import griddle from './griddle.js';
import DynamicSeriesNode from './DynamicSeriesNode.js';
import Circle from '../../scenery/js/nodes/Circle.js';

class SeismographDynamicSeriesNode extends DynamicSeriesNode {

  /**
   * @param {DynamicSeries} dynamicSeries - the data to plot
   * @param {number} plotWidth
   * @param {Bounds2} bounds - bounds for rendering, includes area to the right of the pens
   * @param {Property.<ModelViewTransform2>}modelViewTransformProperty
   */
  constructor( dynamicSeries, plotWidth, bounds, modelViewTransformProperty ) {
    super( dynamicSeries, plotWidth, bounds, modelViewTransformProperty );

    // Create the pen which draws the data at the right side of the graph
    const penNode = new Circle( 4.5, {
      fill: dynamicSeries.color,
      centerX: plotWidth,
      centerY: bounds.height / 2
    } );

    this.addChild( penNode );

    const positionPenListener = () => {
      const modelViewTransform = modelViewTransformProperty.get();

      const lastPoint = dynamicSeries.getLength() - 1;
      if ( lastPoint >= 0 ) {
        const penPoint = dynamicSeries.getDataPoint( lastPoint );

        if ( isNaN( penPoint.y ) ) {
          penNode.centerY = modelViewTransform.modelToViewY( 0 );
        }
        else {
          penNode.centerY = modelViewTransform.modelToViewY( penPoint.y );
        }
      }
    };
    dynamicSeries.addDynamicSeriesListener( positionPenListener );
    modelViewTransformProperty.link( positionPenListener );

    this.disposeSeismographDynamicSeriesNode = () => {
      dynamicSeries.removeDynamicSeriesListener( positionPenListener );
      modelViewTransformProperty.unlink( positionPenListener );
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeSeismographDynamicSeriesNode();
    super.dispose();
  }
}

griddle.register( 'SeismographDynamicSeriesNode', SeismographDynamicSeriesNode );

export default SeismographDynamicSeriesNode;
