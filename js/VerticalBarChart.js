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
  var ClearThermalButton = require( 'SCENERY_PHET/ClearThermalButton' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Panel = require( 'SUN/Panel' );
  var Color = require( 'SCENERY/util/Color' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

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
      xAxisLabels: null,
      thermalEnergyProperty: null,
      thermalEnergyListener: null,
      visible: true
    }, options );

    var self = this;

    // Background for bar graph
    this.background = new Rectangle( 0, 200, options.width, 0, {
      fill: options.backgroundFill,
      stroke: STROKE_COLOR,
      lineWidth: LINE_WIDTH,
      cornerRadius: 5
    } );
    this.background.setRectHeight( options.height );

    // Creation of xAxis
    var xAxis = new Line( 0, 0, options.width - 20, 0, {
      stroke: 'black'
    } );

    // Creation of yAxis in respect to the xAxis
    var yAxis = new ArrowNode( xAxis.getX1(), xAxis.getY1(), 0, -options.height + 20, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 1,
      fill: 'black',
      stroke: null
    } );

    // Layer for all bars added/removed from chart
    // TODO: Use clipArea, ask JO
    this.barLayer = new Node( {
      visible: options.visible
      // clipArea: Shape.rect( 0, -220, 140, 400 );
    } );

    // Layer for the x-axis labels
    this.labelLayer = new Node( {
      visible: options.visible
    } );

    // TODO: add x-axis labels that correspond to the placement of the bar nodes
    // Layer that refers to the chart starting with an origin at 0,0
    var chartNode = new Node( {
      children: [
        this.barLayer,
        this.labelLayer,
        xAxis,
        yAxis
      ],
      center: this.background.center
    } );

    this.barNodes = barNodes;

    // TODO: Make sure to unlink and remove listeners for memory leaks.

    this.positionBar = function( barNode, index ) {
      var centerX = (index + 1) / (barNodes.length + 1) * options.width - 10;

      // Determine the placement for the labels if they exist. There must be the same amount of labels as barNodes.
      // TODO: Add assert so that labels.length === barNodes.length;
      if ( options.xAxisLabels !== null && (barNodes.length === options.xAxisLabels.length) ) {
        var valueNode = new Panel( options.xAxisLabels[ index ], {
          stroke: null,
          fill: new Color( 255, 255, 255, 0.6 ),// put transparency in the color so that the children aren't transparent
          cornerRadius: 3,
          xMargin: 3,
          yMargin: 1
        } );
        self.labelLayer.addChild( valueNode );


        // Empirically determined spacing for the labels. 10% of the chart vertical space.
        var labelSpacing = options.height * 0.10;

        //Realign the axises
        yAxis.setTailAndTip( xAxis.getX1(), xAxis.getY1(), 0, -options.height + 20 );
        xAxis.setY1( -labelSpacing );
        xAxis.setY2( -labelSpacing );
        valueNode.centerX = centerX;
        valueNode.centerY = xAxis.centerY + 20;
        options.xAxisLabels.forEach( function( valueNode ) {
          valueNode.maxWidth = labelSpacing;
        } );
      }

      // Center of the bar determined based on the amount of bars present in the graph and the width of the graph
      barNode.centerX = centerX;
      barNode.bottom = xAxis.getY1();
      barNode.bottom = xAxis.getY1();
      barNode.visible = options.visible;
      self.barLayer.addChild( barNode );
    };

    // Adding barNodes to the chart with proper centering
    this.barNodes.forEach( function( barNode, index ) {
      self.positionBar( barNode, index );
    } );

    if ( options.thermalEnergyProperty ) {
      var clearThermalButton = new ClearThermalButton( {
        listener: options.thermalEnergyListener,
        centerX: self.labelLayer.centerX,
        top: self.labelLayer.bottom,
        scale: 0.5
      } );
      options.thermalEnergyProperty.lazyLink( function( value ) {
        clearThermalButton.enabled = !(value === 0);
      } );
      chartNode.addChild( clearThermalButton );
    }

    // TODO: Max Height of bar should adjust to height of chart area.
    Node.call( this, {
      children: [
        this.background, chartNode
      ]
    } );

    // Title added to the top of the chart area
    if ( options.title !== null ) {
      options.title.centerX = this.background.centerX;
      options.title.top = this.background.top + 4;
      options.title.fill = options.titleFill;
      options.title.visible = options.visible;
      this.addChild( options.title );
    }
  }

  griddle.register( 'VerticalBarChart', VerticalBarChart );

  return inherit( Node, VerticalBarChart, {

    // TODO: Methods to be added  ( removeBars, addOneBars, addBarGroup,)
    removeAllBars: function() {
      this.barLayer.removeAllChildren();
    },

    setBarNode: function( newBarNode, index ) {
      this.positionBar( newBarNode, index );
    }
  } );
} );
