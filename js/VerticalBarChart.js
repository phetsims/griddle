// Copyright 2017, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @constructor
   */
  function VerticalBarChart( barNodes ) {
    var self = this;
    Node.call( this );

    // TODO: draw vertical arrow

    // TODO: draw bars

    // TODO: draw horizontal line (x axis)

    barNodes.forEach( function( barNode ) {
      self.addChild( barNode );
    } );
  }

  griddle.register( 'VerticalBarChart', VerticalBarChart );

  return inherit( Node, VerticalBarChart );
} );