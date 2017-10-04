// Copyright 2017, University of Colorado Boulder

/**
 * The height of a bar node represents the qualitative value of the property it is representing.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Johnathan Olson (PhET Interactive Simulations)
 *
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   *
   * @param {Property} property
   * @param {Object} options
   * @constructor
   */
  function VerticalBarNode( property, options ) {
    Node.call( this );
    var self = this;

    options = _.extend( {
      fill: 'blue',
      stroke: 'black',
      lineWidth: 0,
      label: null,  // x-axis label associated with this bar node
      width: 30,
      minBarHeight: 40, // the furthest a barNode will extend below the x-axis
      maxBarHeight: 300, // maximum threshold that the bar height can reach before being represented as continuous
      displayContinuousArrow: false, // sets visibility of an arrow that represents a continuous bar
      visible: true,
      scaledProperty: null // property that is scaled for zoom in/out functionality
    }, options );

    this.property = property;
    this.maxBarHeight = options.maxBarHeight;

    // @public Creates the body of the bar.
    // TODO: Remove exposure make private.
    this.rectangleNode = new Rectangle( 0, 0, options.width, 100, {
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      visible: options.visible
    } );
    this.addChild( this.rectangleNode );

    // @public Arrow node used to indicate when the value has gone beyond the threshold of this graph
    if ( options.displayContinuousArrow ) {
      this.arrowNode = new ArrowNode( this.rectangleNode.centerX, -options.maxBarHeight - 8, this.rectangleNode.centerX, -options.maxBarHeight - 25, {
        fill: options.fill,
        headWidth: options.width,
        tailWidth: 10,
        stroke: 'black',
        visible: options.visible
      } );
      this.addChild( this.arrowNode );
    }

    // Determines whether the arrow should be shown
    this.displayContinuousArrow = new Property( options.displayContinuousArrow );

    property.link( function( value ) {
      assert && assert( typeof value === 'number' );

      // To represent negative values we are adjusting the bottom of the rectangle
      if ( value < 0 ) {
        self.rectangleNode.setRectHeight( Math.min( options.minBarHeight, Math.abs( value ) ) ); // caps the height of the bar
        self.rectangleNode.bottom = ( Math.min( options.minBarHeight, Math.abs( value ) ) );
        return;
      }
      var height = Math.max( 0.0000001, value ); // bar must have non-zero size
      self.rectangleNode.setRectHeight( Math.min( self.maxBarHeight, height ) ); // caps the height of the bar
      self.rectangleNode.bottom = 0;

      // Change the visibility of the arrowNode
      if ( self.arrowNode ) {
        self.arrowNode.visible = ( self.rectangleNode.getRectHeight() === self.maxBarHeight);
      }
      self.currentHeight = value;
    } );

    this.mutate( options );
  }

  griddle.register( 'VerticalBarNode', VerticalBarNode );

  return inherit( Node, VerticalBarNode );
} );