// Copyright 2017, University of Colorado Boulder

/**
 * @author Denzell Barnett (PhET Interactive Simulations)
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
  function VerticalCompositeBarNode( barNodes, options ) {
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
    this.compositeProperty = new Property();
    this.barNodes = barNodes;

    Node.call( this );

    this.rectangleNode = new Rectangle( 0, 0, options.width, 100, {
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth
    } );

    // @public arrow node used to indicate when the value has gone beyond the scale of this meter
    this.arrowNode = new ArrowNode( this.rectangleNode.centerX, -options.maxHeight - 8, 0, 0, {
      fill: options.fill,
      headWidth: options.width,
      tailWidth: 10,
      stroke: 'black'
    } );
    this.addChild( this.arrowNode );

    var showContinuousArrow = new Property( options.displayContinuousArrow );

    // barNodes.link( function( value ) {
    //   self.rectangleNode.visible = ( value > 0 ); // because we can't create a zero height rectangle
    //   var height = Math.max( 1, value ); // bar must have non-zero size
    //   self.rectangleNode.setRectHeight( Math.min( options.maxHeight, height ) );
    //   self.rectangleNode.bottom = 0;
    //
    //
    // } );

    showContinuousArrow.link( function( shown ) {
      self.arrowNode.visible = shown && options.displayContinuousArrow;
    } );

    var cachedBarNodes = [];
    var barTuples = [];
    barNodes.forEach( function( bar ) {
      barTuples.push( [ bar.property, bar.rectangleNode.fill ] );
    } );

    barTuples.forEach( function( barInfo ) {
      var cachedRect = new Rectangle( 0, 0, options.width, barInfo[ 0 ].value, {
        fill: barInfo[ 1 ],
        stroke: barInfo[ 1 ],
        centerX: 0
      } );
      cachedBarNodes.push( cachedRect );
      barInfo[ 0 ].link( function( value ) {
        cachedRect.visible = ( value > 0 ); // because we can't create a zero height rectangle
        var height = Math.max( 0.001, value ); // bar must have non-zero size
        cachedRect.setRectHeight( Math.min( options.maxHeight, height ) );
        cachedRect.bottom = 0;

        // set the continuous arrow to visible if needed
        var currentHeight = cachedRect.top;
        showContinuousArrow.set( currentHeight === options.maxHeight );

        for ( var i = 0; i < cachedBarNodes.length; i++ ) {
          if ( i !== 0 ) {
            cachedBarNodes[ i ].bottom = cachedBarNodes[ i - 1 ].top;
          }
          else {
            cachedBarNodes[ i ].bottom = 0;
          }
        }
      } );
    } );
    for ( var i = 0; i < cachedBarNodes.length; i++ ) {
      this.addChild( cachedBarNodes[ i ] );
    }


    this.mutate( options );
  }

  griddle.register( 'VerticalCompositeBarNode', VerticalCompositeBarNode );

  return inherit( Node, VerticalCompositeBarNode );
} );