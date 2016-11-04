// Copyright 2014-2015, University of Colorado Boulder

/**
 * XY Plot
 *
 * @author Sam Reid
 * @author Aadish Gupta
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Panel = require( 'SUN/Panel' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var XYDataSeriesNode = require( 'GRIDDLE/XYDataSeriesNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  function XYPlot( options ) {
    var content = new Node();

    options = _.extend( {
      width: 400,
      height: 400,
      backgroundFill: 'white',
      minX: 0,
      maxX: 10,
      minY: 0,
      maxY: 10,
      step: 2,
      showVerticalIntermediateLines: true,
      showHorizontalIntermediateLines: true,
      showXAxisTickMarkLabels: true,
      showYAxisTickMarkLabels: true,
      tickLabelFont: new PhetFont( 16 ),
      lineDash: null,
      showAxis: true
    }, options );

    Node.call( this );
    var content = new Node();

    var rectangle = new Rectangle( 0, -options.height, options.width, options.height, {
      fill: options.backgroundFill
    } );
    //rectangle.center = content.center;
    content.addChild( rectangle );
    var lineWidth;
    var line;
    //vertical grid lines
    // if minX and maxX is not a multiple of step function convert them to multiples
    var minX = options.minX;
    if ( minX % options.step !== 0){
      minX = Math.floor( minX / options.step ) * options.step
    }
    var maxX = options.maxX;
    if ( maxX % options.step !== 0){
      maxX = Math.ceil( maxX / options.step ) * options.step
    }
    var numVerticalGridLines = maxX - minX;
    for ( var i = 0; i < numVerticalGridLines + 1; i++ ) {
      lineWidth = i % options.step === 0 ? 0.8 : 0.3;
      if ( i % options.step === 0 || options.showVerticalIntermediateLines ) {
        line = new Line( i * options.width / numVerticalGridLines, 0, i * options.width / numVerticalGridLines, -options.height, {
          stroke: 'gray',
          lineWidth: lineWidth,
          lineDash: i !== numVerticalGridLines && i !== 0 ? options.lineDash : null
        } );
        content.addChild( line );
      }

      if ( i % options.step === 0 && options.showXAxisTickMarkLabels ) {
        content.addChild( new Text( i + minX , { font: options.tickLabelFont, centerX: line.centerX, top: line.bottom + 6 } ) );
      }
    }

    //horizontal grid lines
    // if minY and maxY is not a multiple of step function convert them to multiples
    var minY = options.minY;
    if ( minY % options.step !== 0){
      minY = Math.floor( minY / options.step ) * options.step
    }
    var maxY = options.maxY;
    if ( maxY % options.step !== 0){
      maxY = Math.ceil( maxY / options.step ) * options.step
    }
    var numHorizontalGridLines = maxY - minY;
    for ( i = 0; i < numHorizontalGridLines + 1; i++ ) {
      lineWidth = i % options.step === 0 ? 0.8 : 0.3;

      if ( i % options.step === 0 || options.showHorizontalIntermediateLines ) {
        line = new Line( 0, -i * options.height / numHorizontalGridLines, options.width, -i * options.height / numHorizontalGridLines, {
          stroke: 'gray',
          lineWidth: lineWidth,
          lineDash: i !== numHorizontalGridLines && i !== 0 ? options.lineDash : null
        } );
        content.addChild( line );
      }
      if ( i % options.step === 0 && options.showYAxisTickMarkLabels ) {
        content.addChild( new Text( i + minY, { font: new PhetFont( 16 ), centerY: line.centerY, right: line.left - 6 } ) );
      }
    }

    if ( options.showAxis ) {
      content.addChild( new ArrowNode( 0, 0, 0, -options.height, {} ) );
      content.addChild( new ArrowNode( 0, 0, options.width, 0, {} ) );
    }


    this.addChild( content );

    /**
     * Map XYDataSeries -> XYDataSeriesNode
     * @public
     * @type {{}}
     */
    this.seriesViewMap = {};
    this.content = content;
  }

  griddle.register( 'XYPlot', XYPlot );

  return inherit( Node, XYPlot, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    },
    appendPoint: function( x, y, color, stroke ) {

    },

    /**
     *
     * @param {XYDataSeries} series
     */
    addSeries: function( series ) {
      this.seriesViewMap[ series ] = new XYDataSeriesNode( series );
      this.content.addChild( this.seriesViewMap[ series ] );
    },

    /**
     *
     * @param {XYDataSeries} series
     */
    removeSeries: function( series ) {
      var view = this.seriesViewMap[ series ];
      this.content.removeChild( view );
      view.dispose();
      delete this.seriesViewMap[ series ];
    }
  } );
} );