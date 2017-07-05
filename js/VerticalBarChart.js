// Copyright 2017, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 *
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
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var LINE_WIDTH = 0.8; // Empirically determined
  var STROKE_COLOR = 'gray';

  /**
   * @constructor
   */
  function VerticalBarChart( barNodes, options ) {
    // TODO: we may want to create the barNodes in the chart because the chart is aware of how much space we are working with.
    options = _.extend( {
      width: 100,
      height: 375,
      backgroundFill: 'white',
      title: null,
      titleFill: 'black',
      xAxisLabels: null
    }, options );

    // Background for bar graph
    this.background = new Rectangle( 0, 200, options.width, options.height, {
      fill: options.backgroundFill,
      stroke: STROKE_COLOR,
      cornerRadius: 8,
      lineWidth: LINE_WIDTH
    } );

    // Creation of xAxis
    var xAxis = new Line( 0, 0, options.width - 20, 0, {
      stroke: 'gray'
    } );

    // Creation of yAxis
    var yAxis = new ArrowNode( xAxis.getX1(), xAxis.getY1(), 0, -options.height + 20, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 1,
      fill: 'black',
      stroke: null
    } );

    // Layer for all bars added/removed from chart
    // TODO: Use clipArea, ask JO
    var barLayer = new Node( {
      // clipArea: Shape.rect( 0, -220, 140, 400 )
    } );

    // TODO: add x-axis labels that correspond to the placement of the bar nodes
    // Layer that refers to the chart starting with an origin at 0,0
    var chartNode = new Node( {
      children: [
        barLayer,
        xAxis,
        yAxis
      ],
      center: this.background.center
    } );

    // Adding barNodes to the chart with proper centering
    barNodes.forEach( function( barNode, index ) {
      var centerX = (index + 1) / (barNodes.length + 1) * options.width - 10;
      barNode.centerX = centerX;
      barNode.bottom = xAxis.getY1();
      barLayer.addChild( barNode );
      if ( options.xAxisLabels !== null && (barNodes.length === options.xAxisLabels.length) ) {
        var labelSpacing = -options.height * (.2);
        yAxis.setTailAndTip( xAxis.getX1(), xAxis.getY1(), 0, -options.height + 20 );
        xAxis.setY1( labelSpacing );
        xAxis.setY2( labelSpacing );
        options.xAxisLabels[ index ].centerX = centerX;
        options.xAxisLabels[ index ].centerY = xAxis.centerY + 20;
        barLayer.addChild( options.xAxisLabels[ index ] );
      }
    } );

    // TODO: Max Height of bar should adjust to height of chart area.
    Node.call( this, {
      children: [
        this.background, chartNode
      ]
    } );

    if ( options.title !== null ) {
      options.title.centerX = this.background.centerX;
      options.title.top = this.background.top + 4;
      options.title.fill = options.titleFill;
      this.addChild( options.title );
    }
  }

  griddle.register( 'VerticalBarChart', VerticalBarChart );

  return inherit( Node, VerticalBarChart );
} );
