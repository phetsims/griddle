// Copyright 2019-2020, University of Colorado Boulder

/**
 * An XYPlotNode that includes a draggable cursor that allows the user to scrub or play back through the data.
 *
 * @author Jesse Greenberg
 */

import Utils from '../../dot/js/Utils.js';
import merge from '../../phet-core/js/merge.js';
import DragListener from '../../scenery/js/listeners/DragListener.js';
import Circle from '../../scenery/js/nodes/Circle.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Color from '../../scenery/js/util/Color.js';
import Tandem from '../../tandem/js/Tandem.js';
import griddle from './griddle.js';
import ScrollingChartNode from './ScrollingChartNode.js';

// constants
const WIDTH_PROPORTION = 0.013; // empirically determined
const CURSOR_FILL_COLOR = new Color( 50, 50, 200, 0.2 );
const CURSOR_STROKE_COLOR = Color.DARK_GRAY;

class XYCursorPlot extends ScrollingChartNode {

  /**
   * @param {NumberProperty} valueProperty
   * @param {Object} [options]
   */
  constructor( valueProperty, options ) {
    options = merge( {

      // options passed on to the chart cursor, see ChartCursor
      cursorOptions: null,

      graphPanelOptions: {

        // so that the cursor is draggable
        pickable: true
      },

      // phet-io
      tandem: Tandem.OPTIONAL
    }, options );

    super( valueProperty, options );

    // @private {boolean|null} - if set with setCursorVisible, then this will indicate visibility of the cursor
    this._cursorVisibleOverride = null;

    // @private {number} - value for the cursor, determines cursor positioning
    this.cursorValue = 0;

    // @private - minimum and maximum recorded value, required by the cursor to limit dragging
    this.minRecordedXValue = 0;
    this.maxRecordedXValue = 0;

    // @private - Keep track of listeners for each series so the listeners can be removed when the series is removed
    this.valueSeriesListenerMap = new Map();

    this.dynamicSeriesList = [];

    // @private {ChartCursor} - draggable Node that shows the cursor value
    this.chartCursor = new ChartCursor( this, this.modelViewTransformProperty, options.cursorOptions );
    this.graphPanel.addChild( this.chartCursor );

    // initialize position and visibility of the cursor
    this.updateChartCursor();
  }

  /**
   * Set the cursor value.
   * @public
   *
   * @param {number} value
   */
  setCursorValue( value ) {
    this.cursorValue = value;
    this.updateChartCursor();
  }

  /**
   * Remove a series from the plot and dispose of the plot specific series listener.
   * @public
   *
   * @param {DynamicSeries} dynamicSeries - to remove
   */
  removeDynamicSeries( dynamicSeries ) {
    super.removeDynamicSeries( dynamicSeries );
    const seriesIndex = this.dynamicSeriesList.indexOf( dynamicSeries );
    this.dynamicSeriesList.splice( seriesIndex, 1 );

    dynamicSeries.removeDynamicSeriesListener( this.valueSeriesListenerMap.get( dynamicSeries ) );
    this.valueSeriesListenerMap.delete( dynamicSeries );
  }

  /**
   * Get the value currently under the cursor.
   * @public
   *
   * @returns {number}
   */
  getCursorValue() {
    return this.cursorValue;
  }

  /**
   * Override the default behavior for setting cursor visibility. If set to null, cursor visibility will behave as
   * described in updateChartCursorVisibility. Otherwise, visibility will equal the boolean value set here.
   * @param {boolean|null} visible
   * @public
   */
  setCursorVisibleOverride( visible ) {
    assert && assert( typeof visible === 'boolean' || visible === null, 'visible must be boolean or null' );
    this._cursorVisibleOverride = visible;
    this.updateChartCursorVisibility();
  }

  /**
   * Update the chart cursor visibility and position.
   * @private
   */
  updateChartCursor() {
    this.updateChartCursorVisibility();
    if ( this.chartCursor.isVisible() ) {
      this.updateChartCursorPos();
    }
  }

  /**
   * Update the chart cursor position.
   * @private
   */
  updateChartCursorPos() {
    this.moveChartCursorToValue( this.cursorValue );
  }

  /**
   * Update the chart cursor visibility. The chart cursor should be visible any time the cursor value is within
   * the recorded value range.
   * @private
   */
  updateChartCursorVisibility() {
    if ( typeof this._cursorVisibleOverride === 'boolean' ) {
      this.chartCursor.setVisible( this._cursorVisibleOverride );
    }
    else {

      const maxX = this.modelViewTransformProperty.get().viewToModelX( this.plotWidth + this.chartCursor.width / 2 );
      const minX = this.modelViewTransformProperty.get().viewToModelX( 0 );

      const isCurrentValueOnChart = ( this.cursorValue >= minX ) && ( this.cursorValue <= maxX );
      const dataExists = this.getDataExists();
      const chartCursorVisible = isCurrentValueOnChart && dataExists;

      this.chartCursor.setVisible( chartCursorVisible );
    }
  }

  /**
   * Add a Dynamic series to the XYCursorPlot.
   * @override
   * @public
   * @param dynamicSeries
   */
  addDynamicSeries( dynamicSeries ) {
    super.addDynamicSeries( dynamicSeries );

    this.dynamicSeriesList.push( dynamicSeries );

    // when a point is added, update the min and max recorded values
    const seriesListener = () => {

      // update the
      this.updateMinMaxRecordedValues();

      // if all data has been removed from the plot, update cursor visibility
      this.updateChartCursor();
    };

    // save to map so that listener can be found again for disposal
    this.valueSeriesListenerMap.set( dynamicSeries, seriesListener );
    dynamicSeries.addDynamicSeriesListener( seriesListener );
  }

  /**
   * Returns true if any data is attached to this plot.
   * @returns {boolean}
   * @public
   */
  getDataExists() {
    let dataExists = false;
    this.valueSeriesListenerMap.forEach( ( listener, dataSeries, map ) => {
      dataExists = dataSeries.hasData();

      // break early
      if ( dataExists ) {
        return;
      }
    } );

    return dataExists;
  }

  /**
   * Move the chart cursor to the specified value.
   * @private
   *
   * @param {number} value
   */
  moveChartCursorToValue( value ) {
    const viewPosition = this.modelViewTransformProperty.get().modelToViewX( value );

    // keep the cursor within the grid bounds
    this.chartCursor.centerX = Utils.clamp( viewPosition, 0, this.plotWidth );
    this.chartCursor.centerY = this.gridNode.centerY;
  }

  /**
   * From the existing data, update the min and max recorded X values from all of the dynamicSeries of this plot,
   * so that the cursor can be limited to the recorded data.
   * @private
   */
  updateMinMaxRecordedValues() {
    let minValue = Number.POSITIVE_INFINITY;
    let maxValue = Number.NEGATIVE_INFINITY;
    this.dynamicSeriesList.forEach( dynamicSeries => {
      if ( dynamicSeries.getLength() > 0 ) {
        const seriesMinValue = dynamicSeries.getDataPoint( 0 ).x;
        const seriesMaxValue = dynamicSeries.getDataPoint( dynamicSeries.getLength() - 1 ).x;
        if ( seriesMinValue < minValue ) {
          minValue = seriesMinValue;
        }
        if ( seriesMaxValue > maxValue ) {
          maxValue = seriesMaxValue;
        }
      }
    } );

    this.minRecordedXValue = minValue;
    this.maxRecordedXValue = maxValue;
  }
}


/**
 * Rectangular cursor that indicates a current or selected value on the chart.
 */
class ChartCursor extends Rectangle {

  /**
   * @param {XYPlotNode} plot
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {Object} [options]
   */
  constructor( plot, modelViewTransformProperty, options ) {

    options = merge( {
      startDrag: () => {},
      endDrag: () => {},
      drag: () => {},

      // phet-io
      tandem: Tandem.OPTIONAL
    }, options );

    const width = plot.plotWidth * WIDTH_PROPORTION;
    const height = plot.plotHeight;

    // Set the shape. Origin is at the center top of the rectangle.
    super( 0, -height, width, height, 0, 0, {
      cursor: 'ew-resize',
      fill: CURSOR_FILL_COLOR,
      stroke: CURSOR_STROKE_COLOR,
      lineWidth: 0.4,
      lineDash: [ 4, 4 ]
    } );

    this.plot = plot;
    this.modelViewTransformProperty = modelViewTransformProperty;

    // Make it easier to grab this cursor by giving it expanded mouse and touch areas.
    this.mouseArea = this.localBounds.dilatedX( 12 );
    this.touchArea = this.localBounds.dilatedX( 12 );

    // Add the indentations that are intended to convey the idea of "gripability".
    const grippyNode = new Node();
    const indentSpacing = height * 0.05;
    for ( let i = 0; i < 3; i++ ) {
      const indentNode = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
      indentNode.top = i * ( indentNode.height + indentSpacing );
      grippyNode.addChild( indentNode );
    }
    grippyNode.center = this.center;
    this.addChild( grippyNode );

    const dragListener = new DragListener( {
      start: ( event, listener ) => {
        assert && assert( this.plot.getDataExists(), 'data should exist for the cursor to be draggable' );
        options.startDrag();
      },
      drag: ( event, listener ) => {
        const parentX = listener.parentPoint.x;
        let newValue = this.modelViewTransformProperty.get().viewToModelX( parentX );

        // limit cursor to the domain of recorded values
        newValue = Utils.clamp( newValue, this.plot.minRecordedXValue, this.plot.maxRecordedXValue );
        this.plot.setCursorValue( newValue );

        options.drag();
      },
      end: ( event, listener ) => {
        options.endDrag();
      },
      tandem: options.tandem.createTandem( 'dragListener' )
    } );
    this.addInputListener( dragListener );
  }
}

/**
 * This node is meant to portray a small round indentation on a surface.  This is a modern user interface paradigm that
 * is intended to convey the concept of "gripability" (sp?), i.e. something that the user can click on and subsequently
 * grab.  This is meant to look somewhat 3D, much like etched borders do.
 */
class GrippyIndentNode extends Circle {

  /**
   * @param {number} diameter
   * @param {Color} baseColor
   * @param {Object} [options]
   */
  constructor( diameter, baseColor, options ) {

    options = merge( {
      lineWidth: 0.5
    }, options );

    const baseDarkerColor = baseColor.darkerColor( 0.9 );
    const translucentDarkerColor = new Color( baseDarkerColor.getRed(), baseDarkerColor.getGreen(),
      baseDarkerColor.getBlue(), baseColor.getAlpha() );
    const baseLighterColor = baseColor.brighterColor( 0.9 );
    const translucentBrighterColor = new Color( baseLighterColor.getRed(), baseLighterColor.getGreen(),
      baseLighterColor.getBlue(), baseColor.getAlpha() );
    const radius = diameter / 2 - options.lineWidth;

    super( radius, {
      fill: translucentDarkerColor,
      stroke: translucentBrighterColor,
      lineWidth: options.lineWidth
    } );
  }
}

griddle.register( 'XYCursorPlot', XYCursorPlot );
export default XYCursorPlot;