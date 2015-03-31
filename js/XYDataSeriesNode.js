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
    function XYDataSeriesNode( xyDataSeries, options ) {
      var xyDataSeriesNode = this;
      Node.call( this, options );

      var listener = function( x, y, xPrevious, yPrevious ) {
        if ( xPrevious && yPrevious && (xPrevious !== 0 || yPrevious !== 0 ) ) {
          xyDataSeriesNode.addChild( new Line( xPrevious, yPrevious, x, y, { stroke: xyDataSeries.color } ) );
        }
      };
      xyDataSeries.addDataSeriesListener( listener );

      /**
       * @public
       */
      this.dispose = function() {
        xyDataSeries.removeDataSeriesListener( listener );
      };
    }

    return inherit( Node, XYDataSeriesNode );
  }
);