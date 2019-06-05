// Copyright 2014-2018, University of Colorado Boulder

/**
 * XY Plot
 *
 * @author Sam Reid
 * @author Aadish Gupta
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var XYDataSeriesNode = require( 'GRIDDLE/XYDataSeriesNode' );

  // constants
  // currently for performance reasons whole plot is drawn as a single path node and therefore all lines
  // whether intermediate or not have same width, but this can be changed in future
  var LINE_WIDTH = 0.8; // Empirically determined
  var STROKE_COLOR = 'gray';
  var LABEL_OFFSET = 6;

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
      stepX: 2,
      stepY: 2,
      showVerticalIntermediateLines: true,
      showHorizontalIntermediateLines: true,
      showXAxisTickMarkLabels: true,
      showYAxisTickMarkLabels: true,
      tickLabelFont: new PhetFont( 16 ),
      lineDash: [],
      showAxis: true
    }, options );

    Node.call( this );

    this.rectangle = new Rectangle( 0, -options.height, options.width, options.height, {
      fill: options.backgroundFill,
      stroke: STROKE_COLOR,
      lineWidth: LINE_WIDTH
    } );
    content.addChild( this.rectangle );

    var plotShape = new Shape();

    //vertical grid lines
    // if minX and maxX is not a multiple of step function convert them to multiples
    this.minX = options.minX;
    if ( this.minX % options.stepX !== 0 ) {
      this.minX = Math.floor( this.minX / options.stepX ) * options.stepX;
    }
    this.maxX = options.maxX;
    if ( this.maxX % options.stepX !== 0 ) {
      this.maxX = Math.ceil( this.maxX / options.stepX ) * options.stepX;
    }
    var numVerticalGridLines = this.maxX - this.minX;
    this.xScaleFactor = options.width / numVerticalGridLines;
    for ( var i = 1; i < numVerticalGridLines; i++ ) {
      var xPosition = i * options.width / numVerticalGridLines;
      if ( i % options.stepX === 0 || options.showVerticalIntermediateLines ) {
        plotShape.moveTo( xPosition, 0 );
        plotShape.lineTo( xPosition, -options.height );
      }

      if ( i % options.stepX === 0 && options.showXAxisTickMarkLabels ) {
        content.addChild( new Text( i + this.minX, {
          font: options.tickLabelFont,
          centerX: xPosition - LINE_WIDTH / 2,
          top: LABEL_OFFSET
        } ) );
      }
    }

    // labels for the edges
    if ( options.showXAxisTickMarkLabels ) {
      content.addChild( new Text( 0 + this.minX, {
        font: options.tickLabelFont,
        centerX: -LINE_WIDTH / 2,
        top: LABEL_OFFSET
      } ) );

      content.addChild( new Text( i + this.minX, {
        font: options.tickLabelFont,
        centerX: i * options.width / numVerticalGridLines - LINE_WIDTH / 2,
        top: LABEL_OFFSET
      } ) );
    }

    // horizontal grid lines
    // if minY and maxY is not a multiple of step function convert them to multiples
    this.minY = options.minY;
    if ( this.minY % options.stepY !== 0 ) {
      this.minY = Math.floor( this.minY / options.stepY ) * options.stepY;
    }
    this.maxY = options.maxY;
    if ( this.maxY % options.stepY !== 0 ) {
      this.maxY = Math.ceil( this.maxY / options.stepY ) * options.stepY;
    }
    var numHorizontalGridLines = this.maxY - this.minY;
    this.yScaleFactor = options.height / numHorizontalGridLines;
    for ( i = 1; i < numHorizontalGridLines; i++ ) {
      var yPosition = -i * options.height / numHorizontalGridLines;
      if ( i % options.stepY === 0 || options.showHorizontalIntermediateLines ) {
        plotShape.moveTo( 0, yPosition );
        plotShape.lineTo( options.width, -i * options.height / numHorizontalGridLines );
      }
      if ( i % options.stepY === 0 && options.showYAxisTickMarkLabels ) {
        content.addChild( new Text( i + this.minY, {
          font: options.tickLabelFont,
          centerY: yPosition + LINE_WIDTH / 2,
          right: -LABEL_OFFSET
        } ) );
      }
    }

    // labels for the edges
    if ( options.showYAxisTickMarkLabels ) {
      content.addChild( new Text( 0 + this.minY, {
        font: options.tickLabelFont,
        centerY: LINE_WIDTH / 2,
        right: -LABEL_OFFSET
      } ) );

      content.addChild( new Text( i + this.minY, {
        font: options.tickLabelFont,
        centerY: -i * options.height / numHorizontalGridLines + LINE_WIDTH / 2,
        right: -LABEL_OFFSET
      } ) );
    }

    if ( options.showAxis ) {
      content.addChild( new ArrowNode( 0, 0, 0, -options.height, {} ) );
      content.addChild( new ArrowNode( 0, 0, options.width, 0, {} ) );
    }

    content.addChild( new Path( plotShape, {
      stroke: STROKE_COLOR,
      lineWidth: LINE_WIDTH,
      lineDash: options.lineDash
    } ) );

    this.addChild( content );

    /**
     * Map XYDataSeries -> XYDataSeriesNode
     * @public
     * @type {{}}
     */
    this.seriesViewMap = {};
    this.content = content;

    this.mutate( options );
  }

  griddle.register( 'XYPlot', XYPlot );

  return inherit( Node, XYPlot, {

    /**
     *
     * @param {XYDataSeries} series
     * @param {boolean} scaleFactor
     */
    addSeries: function( series, scaleFactor ) {
      this.seriesViewMap[ series ] = new XYDataSeriesNode( series, this.rectangle.bounds, new Range( this.minY, this.maxY ), {
        xScaleFactor: scaleFactor ? this.xScaleFactor : 1,
        yScaleFactor: scaleFactor ? -this.yScaleFactor : 1
      } );
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