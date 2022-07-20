// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import { Circle } from '../../scenery/js/imports.js';
import DynamicSeriesNode from './DynamicSeriesNode.js';
import griddle from './griddle.js';

/**
 * @deprecated - please use BAMBOO/GridLineSet
 */
class SeismographDynamicSeriesNode extends DynamicSeriesNode {

  /**
   * @param {DynamicSeries} dynamicSeries - the data to plot
   * @param {number} chartWidth
   * @param {Bounds2} bounds - bounds for rendering, includes area to the right of the pens
   * @param {Property.<ModelViewTransform2>}modelViewTransformProperty
   */
  constructor( dynamicSeries, chartWidth, bounds, modelViewTransformProperty ) {
    assert && deprecationWarning( 'Please use bamboo' );

    super( dynamicSeries, chartWidth, bounds, modelViewTransformProperty );

    // Create the pen which draws the data at the right side of the graph
    const penNode = new Circle( 4.5, {
      fill: dynamicSeries.color,
      centerX: chartWidth,
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
