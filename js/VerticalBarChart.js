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
  var Line = require( 'SCENERY/nodes/Line' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Node = require( 'SCENERY/nodes/Node' );

  // strings
  var LINE_WIDTH = 0.8; // Empirically determined
  var STROKE_COLOR = 'gray';

  /**
   * @constructor
   */
  function VerticalBarChart( barNodes, options ) {
    // TODO: we may want to create the barNodes in the chart because the chart is aware of how much space we are working with.
    options = _.extend( {
      width: 100,
      height: 300,
      backgroundFill: 'white'
    }, options );

    // Background for bar graph
    this.rectangle = new Rectangle( 0, 200, options.width, options.height, {
      fill: options.backgroundFill,
      stroke: STROKE_COLOR,
      cornerRadius: 8,
      lineWidth: LINE_WIDTH
    } );

    // Layer for all bars added/removed from chart
    var barLayer = new Node();

    // Layer that refers to the chart starting with an origin at 0,0
    var chartNode = new Node( {
      children: [
        barLayer,
        new Line( 0, 0, options.width - 20, 0, {
          stroke: 'gray'
        } ),
        new ArrowNode( 0, 0, 0, -options.height + 20, { tailWidth: 2, headWidth: 7 } )
      ],
      center: this.rectangle.center
    } );

    // Adding barNodes to the chart with proper centering
    barNodes.forEach( function( barNode, index ) {
      barNode.centerX = (index + 1) / (barNodes.length + 1) * options.width - 10;
      barLayer.addChild( barNode );
    } );

    Node.call( this, {
      children: [
        this.rectangle, chartNode
      ]
    } );
  }

  griddle.register( 'VerticalBarChart', VerticalBarChart );

  return inherit( Node, VerticalBarChart );
} );
