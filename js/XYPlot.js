// Copyright 2014-2020, University of Colorado Boulder

/**
 * Displays scatter or line data via DynamicSeries on an xy chart.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aadish Gupta (PhET Interactive Simulations)
 */

import Range from '../../dot/js/Range.js';
import Shape from '../../kite/js/Shape.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import ArrowNode from '../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import Tandem from '../../tandem/js/Tandem.js';
import griddle from './griddle.js';
import XYDataSeriesNode from './XYDataSeriesNode.js';

// constants
// currently for performance reasons whole plot is drawn as a single path node and therefore all lines
// whether intermediate or not have same width, but this can be changed in future
const LINE_WIDTH = 0.8; // Empirically determined
const STROKE_COLOR = 'gray';
const LABEL_OFFSET = 6;

function XYPlot( options ) {
  const content = new Node();

  options = merge( {
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

    // {string} - one of PlotStyle, 'line' will display data as a continuous line while 'scatter' will display
    // data as discrete points
    plotStyle: XYDataSeriesNode.PlotStyle.LINE,

    // phet-io
    tandem: Tandem.OPTIONAL
  }, options );

  assert && assert( XYDataSeriesNode.PlotStyle.includes( options.plotStyle ), 'plotStyle must be one of PlotStyle' );

  Node.call( this );

  // @private
  this.rectangle = new Rectangle( 0, -options.height, options.width, options.height, {
    fill: options.backgroundFill,
    stroke: STROKE_COLOR,
    lineWidth: LINE_WIDTH
  } );
  content.addChild( this.rectangle );

  // @private - all labels will be attached to this node
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

  // @private {Enumeration} - see options for documentation
  this.plotStyle = options.plotStyle;

  // @protected - for decoration and layout of sub classes
  this.plotPath = new Path( null, {
    stroke: STROKE_COLOR,
    lineWidth: LINE_WIDTH,
    lineDash: options.lineDash
  } );
  content.addChild( this.plotPath );

  // @private {XYDataSeriesNode[]}
  this.dataSeriesNodes = [];

  this.redrawGrid();

  if ( options.showAxis ) {
    content.addChild( new ArrowNode( 0, 0, 0, -options.height, {} ) );
    content.addChild( new ArrowNode( 0, 0, options.width, 0, {} ) );
  }

  this.addChild( content );

  // @protected - the list of DynamicSeries rendered by this XYPlot.
  this.dataSeriesList = [];

  // @private
  this.content = content;

  this.mutate( options );
}

griddle.register( 'XYPlot', XYPlot );

export default inherit( Node, XYPlot, {

  /**
   * Apply an action for each of the data series.
   * @param {function} callback
   */
  forEachDataSeries( callback ) {
    this.dataSeriesList.forEach( callback );
  },

  /**
   * @public - trigger all data series nodes to repaint
   */
  invalidateDataSeriesNodes() {
    this.dataSeriesNodes.forEach( dataSeriesNode => dataSeriesNode.invalidatePaint() );
  },

  /**
   * @param {DynamicSeries} series
   * @param {boolean} useScaleFactors - if the DynamicSeries is defined in the domain and range of this XYPlot
   *                                  (specified by minX, maxX, minY, maxY) then this should be set to true. But there
   *                                  are cases where this isn't true (like if DynamicSeries is in view coordinates)
   * @public
   */
  addSeries: function( series, useScaleFactors ) {
    assert && assert( this.dataSeriesList.indexOf( series ) < 0, 'DynamicSeries already added to XYPlot' );
    this.dataSeriesList.push( series );
    const dataSeriesNode = new XYDataSeriesNode( series, this.rectangle.bounds, new Range( this.minY, this.maxY ), {
      useScaleFactors: useScaleFactors,
      plotStyle: this.plotStyle
    } );
    this.dataSeriesNodes.push( dataSeriesNode );

    dataSeriesNode.setXScaleFactor( this.xScaleFactor );
    dataSeriesNode.setYScaleFactor( this.yScaleFactor );

    this.content.addChild( dataSeriesNode );
  },

  getXYDataSeriesNode( series ) {
    return _.find( this.dataSeriesNodes, dataSeriesNode => dataSeriesNode.xyDataSeries === series );
  },

  /**
   * @param {DynamicSeries} series
   * @public
   */
  removeSeries: function( series ) {
    const seriesIndex = this.dataSeriesList.indexOf( series );
    assert && assert( seriesIndex >= 0, 'DynamicSeries not attached to XYPlot' );
    this.dataSeriesList.splice( seriesIndex, 1 );

    const xyDataSeriesNode = this.getXYDataSeriesNode( series );
    this.content.removeChild( xyDataSeriesNode );
    xyDataSeriesNode.dispose();
    arrayRemove( this.dataSeriesNodes, xyDataSeriesNode );
  },

  /**
   * Returns true if any data is attached to this plot.
   * @returns {boolean}
   * @public
   */
  getDataExists() {
    return _.some( this.dataSeriesList, dataSeries => dataSeries.hasData() );
  },

  /**
   * Set the plot style for the graph, to be drawn as a line graph or a scatter plot.
   *
   * @param {XYDataSeriesNode.PlotStyle} plotStyle - one of plotStyle
   * @public
   */
  setPlotStyle( plotStyle ) {
    this.plotStyle = plotStyle;

    this.dataSeriesNodes.forEach( dataSeriesNode => dataSeriesNode.setPlotStyle( plotStyle ) );
  },

  /**
   * Set the minimum X for graph and redraw the plot grid.
   *
   * @param {number} minX
   * @public
   */
  setMinX( minX ) {
    this.minX = minX;
    this.redrawGrid();
  },

  /**
   * Set the maximum X for the graph and redraw the plot grid.
   *
   * @param {number} maxX
   * @public
   */
  setMaxX( maxX ) {
    this.maxX = maxX;
    this.redrawGrid();
  },

  /**
   * Set the minimum Y for the graph and redraw the plot grid.
   *
   * @param {number} minY
   * @public
   */
  setMinY( minY ) {
    this.minY = minY;
    this.redrawGrid();
  },

  /**
   * Set the maximum Y for the graph and redraw the plot grid.
   *
   * @param {number} maxY
   * @public
   */
  setMaxY( maxY ) {
    this.maxY = maxY;
    this.redrawGrid();
  },

  /**
   * Set the x step for the grid lines and labels and redraw the grid and labels.
   *
   * @param {number} stepX
   * @public
   */
  setStepX( stepX ) {
    this.stepX = stepX;
    this.redrawGrid();
  },

  /**
   * Set the stepY for the graph and labels and redraw the grid and labels.
   *
   * @param {number} stepY
   * @public
   */
  setStepY( stepY ) {
    this.stepY = stepY;
    this.redrawGrid();
  },

  /**
   * Redraw the grid and all labels. Removes all label text and then adds it back as new text. Also creates
   * a new shape for the grid path depending on minimum, maximum, and step values for the x and y dimensions.
   * So this is an expensive function.
   * @private
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
    const numVerticalGridLines = this.maxX - this.minX;
    this.xScaleFactor = this.plotWidth / numVerticalGridLines;

    let i = 1;
    for ( i = 1; i < numVerticalGridLines; i++ ) {
      const xPosition = i * this.plotWidth / numVerticalGridLines;
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
    // if ( this.minY % this.stepY !== 0 ) {
    //   this.minY = Math.floor( this.minY / this.stepY ) * this.stepY;
    // }
    // if ( this.maxY % this.stepY !== 0 ) {
    //   this.maxY = Math.ceil( this.maxY / this.stepY ) * this.stepY;
    // }
    const numHorizontalGridLines = this.maxY - this.minY;
    this.yScaleFactor = -this.plotHeight / numHorizontalGridLines;

    for ( i = 1; i < numHorizontalGridLines; i++ ) {
      const yPosition = -i * this.plotHeight / numHorizontalGridLines;
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

    // after redrawing the grid, make sure that XYDataSeriesNodes have the correct scale factors and are redrawn
    this.dataSeriesNodes.forEach( dataSeriesNode => {
      dataSeriesNode.setXScaleFactor( this.xScaleFactor );
      dataSeriesNode.setYScaleFactor( this.yScaleFactor );

      dataSeriesNode.invalidatePaint();
    } );
  }
}, {

  // @public static, so clients don't have to require XYDataSeriesNode
  PlotStyle: XYDataSeriesNode.PlotStyle
} );