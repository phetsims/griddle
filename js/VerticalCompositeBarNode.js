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
    var VerticalBarNode = require( 'GRIDDLE/VerticalBarNode' );

  /**
   * @constructor
   */
  function VerticalCompositeBarNode( properties, colors, options ) {
    options = _.extend( {
      arrowFill: 'blue',
      stroke: 'black',
      lineWidth: 0,
      label: null,
      width: 30,
      maxBarHeight: 400,
      displayContinuousArrow: false
    }, options );

    var self = this;
    this.barNodes = [];

    Node.call( this );

    assert && assert( properties.length === colors.length, 'There are not the same amount of properties and colors.' );

    properties.forEach( function( property ) {
      self.barNodes.push( new VerticalBarNode( property, options ) );
    } );

    this.barNodes.forEach( function( barNode, index ) {
      barNode.rectangleNode.fill = colors[ index ];
      self.addChild( barNode );

      barNode.property.link( function( value ) {
        self.barNodes[ index ].updateBarHeight( value );
       
        for ( var i = 0; i < self.barNodes.length; i++ ) {
          // currentHeight+=self.barNodes[index].currentHeight;
          if ( i === 0 ) {
            barNode.Y = 0;
          }
          else {
            barNode.Y = self.barNodes[ i - 1 ].rectangleNode.getRectHeight();
          }
        }

        // self.barNodes[0].rectangleNode.rectY = 0;
        // self.barNodes[1].rectangleNode.rectY = self.barNodes[0].rectangleNode.getRectHeight();
      } );
      } );


    // var cachedBarNodes = []; // Represents the stacked bars
    // var barTuples = []; // Contains all the necessary information to create a bar [{ barProperty, barColor }]
    // barNodes.forEach( function( bar ) {
    //
    //   // Collect the respective properties and colors from each bar that needs to be stacked
    //   barTuples.push( [ bar.property, bar.rectangleNode.fill ] );
    // } );
    //
    // // Create a series of bars based on the information collected above.
    // barTuples.forEach( function( barInfo ) {
    //
    //   // Rectangle used to visually represent the barNode
    //   var cachedRect = new Rectangle( 0, 0, options.width, barInfo[ 0 ].value, {
    //     fill: barInfo[ 1 ],
    //     stroke: barInfo[ 1 ],
    //     centerX: 0
    //   } );
    //   cachedBarNodes.push( cachedRect );
    //
    //   // Link created for each barNodes property
    //   // TODO: @Denzell. Take JB's suggestion of passing in [property],[color] and apply it here. Check blue book.
    //   // We should be following the same patter in in VerticalBarNode.setMonitorProperty()
    //   barInfo[ 0 ].link( function( value ) {
    //     var cachedBarTotalHeight = new Property( 0 );
    //     cachedRect.visible = ( value > 0 ); // because we can't create a zero height rectangle
    //     var height = Math.max( 0.001, value ); // bar must have non-zero size
    //     cachedRect.setRectHeight( Math.min( options.maxBarHeight, height ) ); // caps the height of the bar
    //     cachedRect.bottom = 0;
    //
    //     // The top of every barNode is set to the bottom of the barNode above it
    //     for ( var i = 0; i < cachedBarNodes.length; i++ ) {
    //       if ( i !== 0 ) {
    //         cachedBarNodes[ i ].bottom = cachedBarNodes[ i - 1 ].top;
    //       }
    //       else {
    //         cachedBarNodes[ i ].bottom = 0; // At this point, we are setting the bottom of the bottommost barNode to 0
    //       }
    //       cachedBarTotalHeight.set( cachedBarTotalHeight.get() + cachedBarNodes[ i ].top );
    //     }
    //   } );
    // } );
    //
    // // set the continuous arrow to visible if needed
    // barTuples.forEach( function( barInfo ) {
    //   barInfo[ 0 ].link( function() {
    //     var currentHeight = Math.abs( cachedBarNodes[ cachedBarNodes.length - 1 ].getTop() );
    //     showContinuousArrow.set( currentHeight >= options.maxBarHeight );
    //   } );
    // } );
    //
    // // Add all of the newly created stacked barNodes
    // for ( var i = 0; i < cachedBarNodes.length; i++ ) {
    //   this.addChild( cachedBarNodes[ i ] );
    // }

    this.mutate( options );
  }

    griddle.register( 'VerticalCompositeBarNode', VerticalCompositeBarNode );

    return inherit( Node, VerticalCompositeBarNode );
  }
);
