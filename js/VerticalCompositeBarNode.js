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
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );

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
        displayContinuousArrow: false, // sets visibility of an arrow that represents a continuous bar
        grayOutProperty: new Property( false ), // used to gray out the fill of the whole barNode.
        barHighlightStroke: null // color of the highlight on the edges of the barNode
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
          width: options.width
        } );
        self.barStack.addChild( verticalBarNode );
        return verticalBarNode;
      } );
      self.barStack.setClipArea( Shape.rect( 0, 0, this.barStack.width, -options.maxBarHeight ) );

      // Highlight around the barNode.
      if ( options.barHighlightStroke ) {
        var barHighlight = new Rectangle( 0, 0, options.width, 100, {
          fill: 'black',
          stroke: 'black',
          lineWidth: 2,
          centerX: this.barStack.centerX
        } );
        // barHighlight.setClipArea( Shape.rect( 0, 0, this.barStack.width*200, -options.maxBarHeight ) );
        // this.addChild( barHighlight );
      }

      // @public Arrow node used to indicate when the value has gone beyond the threshold of this graph
      if ( options.displayContinuousArrow ) {
        this.arrowNode = new ArrowNode(
          this.barNodes[ 0 ].rectangleNode.centerX,
          -options.maxBarHeight - 8,
          this.barNodes[ 0 ].rectangleNode.centerX,
          -options.maxBarHeight - 25,
          {
            fill: options.arrowFill,
            headWidth: options.width,
            tailWidth: 10,
            stroke: 'black',
            visible: false
          } );
      }
      this.addChild( this.arrowNode );

      // Responsible for positioning the barNodes
      Property.multilink( properties, function() {
          self.barNodes[ 0 ].bottom = 0;
          for ( var i = 0; i < properties.length - 1; i++ ) {
            self.barNodes[ i + 1 ].bottom = self.barNodes[ i ].top;
            properties[ i ].value < 0 ? options.grayOutProperty.set( true ) : options.grayOutProperty.set( false );
            // barHighlight.visible = properties[ i ].value < 0;
          }
        if ( self.arrowNode ) {
          self.arrowNode.visible = ( self.barStack.height >= options.maxBarHeight);
        }
        barHighlight.bottom = 0;
        barHighlight.setRect( self.barStack.x, self.barStack.y, self.barStack.width,
          self.barStack.height );
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