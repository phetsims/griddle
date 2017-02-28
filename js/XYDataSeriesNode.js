// Copyright 2014-2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author Aadish Gupta
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
   * @param {XYDataSeries} xyDataSeries
   * @param {Number} minX
   * @param {Number} minY
   * @param {Number} maxX
   * @param {Number} maxY
   * @param {Object} [options]
   * @constructor
   */
  function XYDataSeriesNode( xyDataSeries, minX, minY, maxX, maxY, options ) {

    var self = this;
    options = _.extend( {
      xScaleFactor: 1,
      yScaleFactor: 1
    }, options );

    Node.call( this, options );

    var listener = function( x, y, xPrevious, yPrevious ) {
      if ( !isNaN( xPrevious ) && !isNaN( yPrevious ) && (xPrevious !== 0 || yPrevious !== 0 ) ) {
        // make sure current x and y are in the range before plotting them
        if ( x >= minX && x <= maxX && y >= minY && y <= maxY ) {
          self.addChild( new Line( xPrevious * options.xScaleFactor,
            yPrevious * options.yScaleFactor,
            x * options.xScaleFactor,
            y * options.yScaleFactor,
            {
              stroke: xyDataSeries.color,
              lineWidth: xyDataSeries.lineWidth
            }
          ) );
        }
      }
    };

    var clearListener = function() {
      self.removeAllChildren();
    };
    xyDataSeries.addDataSeriesListener( listener );
    xyDataSeries.cleared.addListener( clearListener );

    /**
     * @public
     */
    this.disposeXYDataSeriesNode = function() {
      xyDataSeries.removeDataSeriesListener( listener );
      xyDataSeries.cleared.removeListener( clearListener );
    };
  }

  griddle.register( 'XYDataSeriesNode', XYDataSeriesNode );

  return inherit( Node, XYDataSeriesNode, {

    /**
     * Make eligible for garbage collection.
     */
    dispose: function() {
      this.disposeXYDataSeriesNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );