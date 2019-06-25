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
  var Tandem = require( 'TANDEM/Tandem' );
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
      showAxis: true,

      // phet-io
      tandem: Tandem.optional
    }, options );

    Node.call( this );

    this.rectangle = new Rectangle( 0, -options.height, options.width, options.height, {
      fill: options.backgroundFill,
      stroke: STROKE_COLOR,
      lineWidth: LINE_WIDTH
    } );
    content.addChild( this.rectangle );

    // all labels will be attached to this node
    this.labelsNode = new Node();
    this.addChild( this.labelsNode );

    // @public (read-only) {number} - range and domain for the graph and step sizes to define where grid lines will be drawn
    this.minX = options.minX;
    this.maxX = options.maxX;
    this.minY = options.minY;
    this.maxY = options.maxY;
    this.stepY = options.stepY;
    this.stepX = options.stepX;

    // @private {number} - dimensions for the plot and grid, excluding labels
    this.plotWidth = options.width;
    this.plotHeight = options.height;

    // @private - font for the tick labels for grid lines
    this.tickLabelFont = options.tickLabelFont;

    // @private {boolean} - whether lines and tick marks should be shown
    this.showHorizontalIntermediateLines = options.showHorizontalIntermediateLines;
    this.showVerticalIntermediateLines = options.showVerticalIntermediateLines;
    this.showXAxisTickMarkLabels = options.showXAxisTickMarkLabels;
    this.showYAxisTickMarkLabels = options.showYAxisTickMarkLabels;

    // @protected - for decoration and layout of sub classes
    this.plotPath = new Path( null, {
      stroke: STROKE_COLOR,
      lineWidth: LINE_WIDTH,
      lineDash: options.lineDash
    } );
    content.addChild( this.plotPath );

    this.redrawGrid();

    if ( options.showAxis ) {
      content.addChild( new ArrowNode( 0, 0, 0, -options.height, {} ) );
      content.addChild( new ArrowNode( 0, 0, options.width, 0, {} ) );
    }

    this.addChild( content );

    /**
     * Map XYDataSeries.uniqueId -> XYDataSeriesNode, for disposal and so that one can access an XYDataSeriesNode
     * if necessary.
     * @public
     * @type {{}}
     */
    this.seriesViewMap = {};

    // @public - the list of XYDataSeries attached to this XYPlot.
    // TODO: not necessary when we support Map because these can be the keys of this.seriesViewMap and retrieved that
    // way, see https://github.com/phetsims/tasks/issues/992
    this.dataSeriesList = [];

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
      assert && assert( this.dataSeriesList.indexOf( series ) < 0, 'XYDataSeries already added to XYPlot' );
      this.dataSeriesList.push( series );
      this.seriesViewMap[ series.uniqueId ] = new XYDataSeriesNode( series, this.rectangle.bounds, new Range( this.minY, this.maxY ), {
        xScaleFactor: scaleFactor ? this.xScaleFactor : 1,
        yScaleFactor: scaleFactor ? -this.yScaleFactor : 1
      } );
      this.content.addChild( this.seriesViewMap[ series.uniqueId ] );
    },

    /**
     *
     * @param {XYDataSeries} series
     */
    removeSeries: function( series ) {
      const seriesIndex = this.dataSeriesList.indexOf( series );
      assert && assert( seriesIndex >= 0, 'XYDataSeries not attached to XYPlot' );
      this.dataSeriesList.splice( seriesIndex, 1 );

      var view = this.seriesViewMap[ series.uniqueId ];
      this.content.removeChild( view );
      view.dispose();
      delete this.seriesViewMap[ series.uniqueId ];
    },

    /**
     * Set the minimum X for graph and redraw the plot grid.
     *
     * @param {number} minX
     */
    setMinX( minX ) {
      this.minX = minX;
      this.redrawGrid();
    },

    /**
     * Set the maximum X for the graph and redraw the plot grid.
     *
     * @param {number} maxX
     */
    setMaxX( maxX ) {
      this.maxX = maxX;
      this.redrawGrid();
    },

    /**
     * Set the minimum Y for the graph and redraw the plot grid.
     *
     * @param {} minY
     */
    setMinY( minY ) {
      this.minY = minY;
      this.redrawGrid();
    },

    /**
     * Set the maximum Y for the graph and redraw the plot grid.
     *
     * @param {} maxY
     */
    setMaxY( maxY ) {
      this.maxY = maxY;
      this.redrawGrid();
    },

    /**
     * Set the x step for the grid lines and labels and redraw the grid and labels.
     *
     * @param {number} stepX
     */
    setStepX( stepX ) {
      this.stepX = stepX;
      this.redrawGrid();
    },

    /**
     * Set the stepY for the graph and labels and redraw the grid and labels.
     *
     * @param {number} stepY
     */
    setStepY( stepY ) {
      this.stepY = stepY;
      this.redrawGrid();
    },

    /**
     * Redraw the grid and all labels. Removes all label text and then adds it back as new text. Also creates
     * a new shape for the grid path depending on minimum, maximum, and step values for the x and y dimensions.
     * So this is an expensive function.
     */
    redrawGrid() {
      this.labelsNode.removeAllChildren();
      const newPlotShape = new Shape();

      //vertical grid lines
      // if minX and maxX is not a multiple of step function convert them to multiples
      if ( this.minX % this.stepX !== 0 ) {
        this.minX = Math.floor( this.minX / this.stepX ) * this.stepX;
      }
      if ( this.maxX % this.stepX !== 0 ) {
        this.maxX = Math.ceil( this.maxX / this.stepX ) * this.stepX;
      }
      var numVerticalGridLines = this.maxX - this.minX;
      this.xScaleFactor = this.plotWidth / numVerticalGridLines;

      let i = 1;
      for ( i = 1; i < numVerticalGridLines; i++ ) {
        var xPosition = i * this.plotWidth / numVerticalGridLines;
        if ( i % this.stepX === 0 || this.showVerticalIntermediateLines ) {
          newPlotShape.moveTo( xPosition, 0 );
          newPlotShape.lineTo( xPosition, -this.plotHeight );
        }

        if ( i % this.stepX === 0 && this.showXAxisTickMarkLabels ) {
          this.labelsNode.addChild( new Text( i + this.minX, {
            font: this.tickLabelFont,
            centerX: xPosition - LINE_WIDTH / 2,
            top: LABEL_OFFSET
          } ) );
        }
      }

      // labels for the edges
      if ( this.showXAxisTickMarkLabels ) {
        this.labelsNode.addChild( new Text( 0 + this.minX, {
          font: this.tickLabelFont,
          centerX: -LINE_WIDTH / 2,
          top: LABEL_OFFSET
        } ) );

        this.labelsNode.addChild( new Text( i + this.minX, {
          font: this.tickLabelFont,
          centerX: i * this.plotWidth / numVerticalGridLines - LINE_WIDTH / 2,
          top: LABEL_OFFSET
        } ) );
      }

      // horizontal grid lines
      // if minY and maxY is not a multiple of step function convert them to multiples
      if ( this.minY % this.stepY !== 0 ) {
        this.minY = Math.floor( this.minY / this.stepY ) * this.stepY;
      }
      if ( this.maxY % this.stepY !== 0 ) {
        this.maxY = Math.ceil( this.maxY / this.stepY ) * this.stepY;
      }
      var numHorizontalGridLines = this.maxY - this.minY;
      this.yScaleFactor = this.plotHeight / numHorizontalGridLines;

      for ( i = 1; i < numHorizontalGridLines; i++ ) {
        var yPosition = -i * this.plotHeight / numHorizontalGridLines;
        if ( i % this.stepY === 0 || this.showHorizontalIntermediateLines ) {
          newPlotShape.moveTo( 0, yPosition );
          newPlotShape.lineTo( this.plotWidth, -i * this.plotHeight / numHorizontalGridLines );
        }
        if ( i % this.stepY === 0 && this.showYAxisTickMarkLabels ) {
          this.labelsNode.addChild( new Text( i + this.minY, {
            font: this.tickLabelFont,
            centerY: yPosition + LINE_WIDTH / 2,
            right: -LABEL_OFFSET
          } ) );
        }
      }

      this.plotPath.setShape( newPlotShape );

      // labels for the edges
      if ( this.showYAxisTickMarkLabels ) {
        this.labelsNode.addChild( new Text( 0 + this.minY, {
          font: this.tickLabelFont,
          centerY: LINE_WIDTH / 2,
          right: -LABEL_OFFSET
        } ) );

        this.labelsNode.addChild( new Text( i + this.minY, {
          font: this.tickLabelFont,
          centerY: -i * this.plotHeight / numHorizontalGridLines + LINE_WIDTH / 2,
          right: -LABEL_OFFSET
        } ) );
      }
    }
  } );
} );