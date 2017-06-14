// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Johnathan Olson (PhET Interactive Simulations)
 * 
 */
define( function( require ) {
  'use strict';

  // modules
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @constructor
   */
  function VerticalBarNode( property, options ) {
    options = _.extend( {
      fill: 'blue',
      stroke: 'black',
      lineWidth: 0,
      label: null, // Optional label which
      width: 30,
      maxHeight: 400
    }, options );

    var self = this;
    this.property = property;

    Node.call( this );

    this.rectangleNode = new Rectangle( 0, 0, options.width, 100, {
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth
    } );

    this.addChild( this.rectangleNode );
    property.link( function( value ) {
      self.rectangleNode.visible = ( value > 0 ); // because we can't create a zero height rectangle
      var height = Math.max( 1, value ); // bar must have non-zero size
      self.rectangleNode.setRectHeight( Math.min( options.maxHeight, height ) );
      self.rectangleNode.bottom = 0;
    } );
    this.mutate( options );
  }

  griddle.register( 'VerticalBarNode', VerticalBarNode );

  return inherit( Node, VerticalBarNode );
} );