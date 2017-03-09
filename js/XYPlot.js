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
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var XYDataSeriesNode = require( 'GRIDDLE/XYDataSeriesNode' );

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

    var rectangle = new Rectangle( 0, -options.height, options.width, options.height, {
      fill: options.backgroundFill
    } );
    //rectangle.center = content.center;
    content.addChild( rectangle );
    var lineWidth;
    var line;
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
    for ( var i = 0; i < numVerticalGridLines + 1; i++ ) {
      lineWidth = i % options.stepX === 0 ? 0.8 : 0.3;
      if ( i % options.stepX === 0 || options.showVerticalIntermediateLines ) {
        line = new Line( i * options.width / numVerticalGridLines, 0, i * options.width / numVerticalGridLines, -options.height, {
          stroke: 'gray',
          lineWidth: lineWidth,
          lineDash: i !== numVerticalGridLines && i !== 0 ? options.lineDash : []
        } );
        content.addChild( line );
      }

      if ( i % options.stepX === 0 && options.showXAxisTickMarkLabels ) {
        content.addChild( new Text( i + this.minX, {
          font: options.tickLabelFont,
          centerX: line.centerX,
          top: line.bottom + 6
        } ) );
      }
    }

    //horizontal grid lines
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
    for ( i = 0; i < numHorizontalGridLines + 1; i++ ) {
      lineWidth = i % options.stepY === 0 ? 0.8 : 0.3;

      if ( i % options.stepY === 0 || options.showHorizontalIntermediateLines ) {
        line = new Line( 0, -i * options.height / numHorizontalGridLines, options.width, -i * options.height / numHorizontalGridLines, {
          stroke: 'gray',
          lineWidth: lineWidth,
          lineDash: i !== numHorizontalGridLines && i !== 0 ? options.lineDash : []
        } );
        content.addChild( line );
      }
      if ( i % options.stepY === 0 && options.showYAxisTickMarkLabels ) {
        content.addChild( new Text( i + this.minY, {
          font: new PhetFont( 16 ),
          centerY: line.centerY,
          right: line.left - 6
        } ) );
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

    /**
     *
     * @param {XYDataSeries} series
     * @param {boolean} scaleFactor
     */
    addSeries: function( series, scaleFactor ) {
      var xRange = new Range( this.minX, this.maxX );
      var yRange = new Range( this.minY, this.maxY );
      this.seriesViewMap[ series ] = new XYDataSeriesNode( series, xRange, yRange, this.bounds, {
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