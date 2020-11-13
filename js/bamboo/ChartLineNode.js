// Copyright 2020, University of Colorado Boulder

import Line from '../../../scenery/js/nodes/Line.js';
import griddle from '../griddle.js';

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

class ChartLineNode extends Line {

  constructor( chartModel, x1, y1, x2, y2, options ) {

    super( 0, 0, 0, 0, options );

    chartModel.modelViewTransformProperty.link( modelViewTransform => {
      const viewX1 = modelViewTransform.modelToViewX( x1 );
      const viewY1 = modelViewTransform.modelToViewY( y1 );
      const viewX2 = modelViewTransform.modelToViewX( x2 );
      const viewY2 = modelViewTransform.modelToViewY( y2 );
      this.setLine( viewX1, viewY1, viewX2, viewY2 );
    } );
  }
}

griddle.register( 'ChartLineNode', ChartLineNode );
export default ChartLineNode;