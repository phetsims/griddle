// Copyright 2017, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Node = require( 'SCENERY/nodes/Node' );

  // strings
  var LINE_WIDTH = 0.8; // Empirically determined
  var STROKE_COLOR = 'gray';
  var LABEL_OFFSET = 6;

  /**
   * @constructor
   */
  function VerticalBarChart( barNodes, options ) {
    var self = this;

    var content = new Node();

    options = _.extend( {
      width: 400,
      height: 400,
      backgroundFill: 'white'
    }, options );
    Node.call( this );

    // TODO: draw vertical arrow
    this.yAxis = new ArrowNode( 0, 0, 10, 10 );

    // TODO: draw bars
    this.rectangle = new Rectangle( 0, 200, options.width, options.height, {
      fill: options.backgroundFill,
      stroke: STROKE_COLOR,
      cornerRadius: 8,
      lineWidth: LINE_WIDTH,
      children: [ this.yAxis ]
    } );
    content.addChild( this.rectangle );

    barNodes.forEach( function( barNode ) {
      self.addChild( barNode );

      // TODO: draw horizontal line (x axis)
      
    } );
    this.addChild( content );
  }

  griddle.register( 'VerticalBarChart', VerticalBarChart );

  return inherit( Node, VerticalBarChart );
} );