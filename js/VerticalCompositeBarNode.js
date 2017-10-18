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
  var Shape = require( 'KITE/Shape' );
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
        maxBarHeight: 200, // maximum threshold that the bar height can reach before being represented as continuous
        displayContinuousArrow: false,
        grayOutProperty: new Property( false ) // used to gray out the fill of the whole barNode.
      }, options );

      var self = this;
      assert && assert( properties.length === colors.length, 'There are not the same amount of barNode properties and colors.' );

      this.barStack = new Node();
      // Creates an array of verticalBarNodes with the array of properties passed in above.
      this.barNodes = properties.map( function( property, index ) {
        var verticalBarNode = new VerticalBarNode( property, {
          fill: colors[ index ],
          displayContinuousArrow: false,
          maxBarHeight: options.maxBarHeight,
          width: options.width // TODO: Why should we have to redefine this? And Why half the default width of the verticalBarNode?
        } );
        self.barStack.addChild( verticalBarNode );
        return verticalBarNode;
      } );
      self.barStack.setClipArea( Shape.rect( 0, 0, this.barStack.width, -options.maxBarHeight ) );

      // Responsible for positioning the barNodes
      Property.multilink( properties, function() {
          self.barNodes[ 0 ].bottom = 0;
          for ( var i = 0; i < properties.length - 1; i++ ) {
            self.barNodes[ i + 1 ].bottom = self.barNodes[ i ].top;
            properties[ i ].value < 0 ? options.grayOutProperty.set( true ) : options.grayOutProperty.set( false );
          }
        }
      );

      // Link responsible for setting the fill of the vertical barNodes if they are to be grayed out
      options.grayOutProperty.link( function( grayOut ) {
        if ( grayOut ) {
          self.barNodes.forEach( function( barNode ) {
            barNode.rectangleNode.fill = '#908f8f';
          } );
        }
        else {
          self.barNodes.forEach( function( barNode ) {
            barNode.rectangleNode.fill = barNode.options.fill;
          } );
        }
      } );

      this.addChild( this.barStack );
      this.mutate( options );
    }

    griddle.register( 'VerticalCompositeBarNode', VerticalCompositeBarNode );

    return inherit( Node, VerticalCompositeBarNode );
  }
);