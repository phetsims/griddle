//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
    'use strict';

    // modules
    var inherit = require( 'PHET_CORE/inherit' );
    var Node = require( 'SCENERY/nodes/Node' );
    var Line = require( 'SCENERY/nodes/Line' );
    var Bounds2 = require( 'DOT/Bounds2' );

    var bounds2 = new Bounds2( 0, 0, 0, 0 );

    function computeShapeBounds() {
      return bounds2;
    }

    /**
     *
     * @constructor
     */
    function XYDataSeriesNode( xyDataSeries, chartModelViewTransform, options ) {
      var xyDataSeriesNode = this;
      Node.call( this, options );

      xyDataSeries.addDataSeriesListener( function( x, y, xPrevious, yPrevious ) {
        if ( xPrevious && yPrevious && (xPrevious !== 0 || yPrevious !== 0 ) ) {
          var line = new Line(
            chartModelViewTransform.modelToViewX( xPrevious ),
            chartModelViewTransform.modelToViewY( yPrevious ),
            chartModelViewTransform.modelToViewX( x ),
            chartModelViewTransform.modelToViewY( y ), {
              stroke: xyDataSeries.color
            }
          );
          line.computeShapeBounds = computeShapeBounds;
          xyDataSeriesNode.addChild( line );
        }

        xyDataSeries.on( 'cleared', function() {
          xyDataSeriesNode.removeAllChildren();
        } );

      } );

      return inherit( Node, XYDataSeriesNode );
    }
  }
);