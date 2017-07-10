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
      label: null,
      width: 30,
      maxHeight: 400,
      displayContinuousArrow: false
    }, options );

    var self = this;
    this.barNodes = barNodes;

    Node.call( this );

    // @public Creates the body of the bar.
    this.rectangleNode = new Rectangle( 0, 0, options.width, 100, {
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth
    } );

    // @public arrow node used to indicate when the value has gone beyond the scale of this meter
    this.arrowNode = new ArrowNode( this.rectangleNode.centerX, -options.maxHeight - 8, this.rectangleNode.centerX, -options.maxHeight - 25, {
      fill: options.fill,
      headWidth: options.width,
      tailWidth: 10,
      stroke: 'black'
    } );
    this.addChild( this.arrowNode );

    // Determines whether the arrow should be shown
    var showContinuousArrow = new Property( options.displayContinuousArrow );
    showContinuousArrow.link( function( showContinuousArrow ) {
      self.arrowNode.visible = showContinuousArrow;
    } );

    var cachedBarNodes = []; // Represents the stacked bars
    var barTuples = []; // Contains all the necessary information to create a bar [{ barProperty, barColor }]
    barNodes.forEach( function( bar ) {

      // Collect the respective properties and colors from each bar that needs to be stacked
      barTuples.push( [ bar.property, bar.rectangleNode.fill ] );
    } );

    // Create a series of bars based on the information collected above.
    barTuples.forEach( function( barInfo ) {

      // Rectangle used to visually represent the barNode
      var cachedRect = new Rectangle( 0, 0, options.width, barInfo[ 0 ].value, {
        fill: barInfo[ 1 ],
        stroke: barInfo[ 1 ],
        centerX: 0
      } );
      cachedBarNodes.push( cachedRect );

      // Link created for each barNodes property
      barInfo[ 0 ].link( function( value ) {
        cachedRect.visible = ( value > 0 ); // because we can't create a zero height rectangle
        var height = Math.max( 0.001, value ); // bar must have non-zero size
        cachedRect.setRectHeight( Math.min( options.maxHeight, height ) ); // caps the height of the bar
        cachedRect.bottom = 0;

        // set the continuous arrow to visible if needed
        var currentHeight = cachedRect.top;
        showContinuousArrow.set( currentHeight === options.maxHeight );

        // The top of every barNode is set to the bottom of the barNode above it
        for ( var i = 0; i < cachedBarNodes.length; i++ ) {
          if ( i !== 0 ) {
            cachedBarNodes[ i ].bottom = cachedBarNodes[ i - 1 ].top;
          }
          else {
            cachedBarNodes[ i ].bottom = 0; // At this point, we are setting the bottom of the bottommost barNode to 0
          }
        }
      } );
    } );

    // Add all of the newly created stacked barNodes
    for ( var i = 0; i < cachedBarNodes.length; i++ ) {
      this.addChild( cachedBarNodes[ i ] );
    }

    this.mutate( options );
  }

  griddle.register( 'VerticalCompositeBarNode', VerticalCompositeBarNode );

  return inherit( Node, VerticalCompositeBarNode );
} );