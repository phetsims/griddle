// Copyright 2017, University of Colorado Boulder

/**
 * The composite bar node is created by vertically stacking a series of vertical barNodes
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 *
 */
define( function( require ) {
    'use strict';

    // modules
    var griddle = require( 'GRIDDLE/griddle' );
    var inherit = require( 'PHET_CORE/inherit' );
    var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
    var VerticalBarNode = require( 'GRIDDLE/VerticalBarNode' );

  /**
   * @param {Array.<Property.<number>>} properties - the properties provided will be used to create new bar nodes
   * @param {Array.<String>} colors - the colors provided will be used to for the fill values of the new bar nodes
   * @param {Object} options
   *
   * @constructor
   */
  function VerticalCompositeBarNode( properties, colors, options ) {
    Node.call( this );

    options = _.extend( {
      arrowFill: 'blue',
      stroke: 'black',
      lineWidth: 0,
      label: null, // x-axis label associated with this bar node
      width: 30,
      maxBarHeight: 400, // maximum threshold that the bar height can reach before being represented as continuous
      displayContinuousArrow: false
    }, options );

    var self = this;
    assert && assert( properties.length === colors.length, 'There are not the same amount of properties and colors.' );

    // Creates an array of verticalBarNodes with the array of properties passed in above.
    this.barNodes = properties.map( function( property, index ) {
      var verticalBarNode = new VerticalBarNode( property, {
        fill: colors[ index ],
        displayContinuousArrow: false
      } );
      self.addChild( verticalBarNode );
      return verticalBarNode;
    } );

    // Responsible for positioning the barNodes
    Property.multilink( properties, function() {
      self.barNodes[ 0 ].bottom = 0;
      console.log( 'link fired' );
      for ( var i = 0; i < properties.length - 1; i++ ) {
        self.barNodes[ i + 1 ].bottom = self.barNodes[ i ].top;
        console.log( 'self.barNodes[ i + 1 ].bottom = ' + self.barNodes[ i + 1 ].bottom );
      }
      } );

    this.mutate( options );
  }

    griddle.register( 'VerticalCompositeBarNode', VerticalCompositeBarNode );

  return inherit( Node, VerticalCompositeBarNode );
  }
);
