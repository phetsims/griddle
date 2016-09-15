// Copyright 2014-2015, University of Colorado Boulder

/**
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
  var griddle = require( 'GRIDDLE/griddle' );

  /**
   *
   * @constructor
   */
  function XYDataSeriesNode( xyDataSeries, options ) {

    var self = this;

    Node.call( this, options );

    var listener = function( x, y, xPrevious, yPrevious ) {
      if ( xPrevious && yPrevious && (xPrevious !== 0 || yPrevious !== 0 ) ) {
        self.addChild( new Line( xPrevious, yPrevious, x, y, { stroke: xyDataSeries.color } ) );
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

  griddle.register( 'XYDataSeriesNode', XYDataSeriesNode );

  return inherit( Node, XYDataSeriesNode );
} );