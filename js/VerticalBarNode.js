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
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Property = require( 'AXON/Property' );

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
      maxHeight: 400,
      displayContinuousArrow: false
    }, options );

    var self = this;
    this.property = property;

    Node.call( this );

    // @public Creates the body of the bar.
    this.rectangleNode = new Rectangle( 0, 0, options.width, 100, {
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth
    } );
    this.addChild( this.rectangleNode );

    // @public Arrow node used to indicate when the value has gone beyond the scale of this meter
    this.arrowNode = new ArrowNode( this.rectangleNode.centerX, -options.maxHeight - 8, this.rectangleNode.centerX, -options.maxHeight - 25, {
      fill: options.fill,
      headWidth: options.width,
      tailWidth: 10,
      stroke: 'black'
    } );
    this.addChild( this.arrowNode );

    // Determines whether the arrow should be shown
    var displayContinuousArrow = new Property( options.displayContinuousArrow );

    // Link that changes the height of the bar based on the property associated with the bar.
    property.link( function( value ) {
      self.rectangleNode.visible = ( value > 0 ); // because we can't create a zero height rectangle
      var height = Math.max( 1, value ); // bar must have non-zero size
      self.rectangleNode.setRectHeight( Math.min( options.maxHeight, height ) ); // caps the height of the bar
      self.rectangleNode.bottom = 0;

      // set the continuous arrow to visible bar equals or exceeds maxHeight
      var currentHeight = self.rectangleNode.getRectHeight();
      displayContinuousArrow.set( currentHeight === options.maxHeight );
    } );

    // Change the visiblity of the arrowNode
    displayContinuousArrow.link( function( showContinuousArrow ) {
      self.arrowNode.visible = showContinuousArrow;
    } );
    this.mutate( options );
  }

  griddle.register( 'VerticalBarNode', VerticalBarNode );

  return inherit( Node, VerticalBarNode );
} );