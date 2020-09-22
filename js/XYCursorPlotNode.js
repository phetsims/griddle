// Copyright 2019-2020, University of Colorado Boulder

/**
 * An XYPlotNode that includes a draggable cursor that allows the user to scrub or play back through the data.
 *
 * @author Jesse Greenberg
 */

import Utils from '../../dot/js/Utils.js';
import merge from '../../phet-core/js/merge.js';
import ArrowNode from '../../scenery-phet/js/ArrowNode.js';
import DragListener from '../../scenery/js/listeners/DragListener.js';
import Circle from '../../scenery/js/nodes/Circle.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Color from '../../scenery/js/util/Color.js';
import Tandem from '../../tandem/js/Tandem.js';
import griddle from './griddle.js';
import XYPlotNode from './XYPlotNode.js';

// constants
const WIDTH_PROPORTION = 0.013; // empirically determined
const CURSOR_FILL_COLOR = new Color( 50, 50, 200, 0.2 );
const CURSOR_STROKE_COLOR = Color.DARK_GRAY;
const ARROW_CUE_FILL_COLOR = new Color( 180, 180, 230 );
const ARROW_CUE_STROKE_COLOR = Color.DARK_GRAY;

class XYCursorPlotNode extends XYPlotNode {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {

      // options passed on to the cursor, see ChartCursor
      cursorOptions: null,

      chartPanelOptions: {

        // so that the cursor is draggable
        pickable: true
      },

      // phet-io
      tandem: Tandem.OPTIONAL
    }, options );

    super( options );

    // @private {boolean|null} - if set with setCursorVisible, then this will indicate visibility of the cursor
    this._cursorVisibleOverride = null;

    // @private {number} - value for the cursor, determines cursor positioning
    this.cursorValue = 0;

    // @public (read-only) - minimum and maximum recorded value, required by the cursor to limit dragging
    this.minRecordedXValue = 0;
    this.maxRecordedXValue = 0;

    // @private Map.<DynamicSeries,function> Keep track of the listener for each series, so the listener can be removed
    // when a series is removed.
    this.dynamicSeriesListenerMap = new Map();

    // @protected (read-only) {DynamicSeries[]}
    this.dynamicSeriesArray = [];

    // @private {ChartCursor} - draggable Node that shows the cursor value
    this.chartCursor = new ChartCursor( this, this.modelViewTransformProperty, options.cursorOptions );
    this.chartPanel.addChild( this.chartCursor );

    // initialize position and visibility of the cursor
    this.updateCursor();
  }

  /**
   * Adds a DynamicSeries to the XYCursorPlotNode.
   * @override
   * @public
   *
   * @param {DynamicSeries} dynamicSeries
   */
  addDynamicSeries( dynamicSeries ) {
    super.addDynamicSeries( dynamicSeries );

    this.dynamicSeriesArray.push( dynamicSeries );

    // when a point is added, update the min and max recorded values
    const dynamicSeriesListener = () => {

      // update the
      this.updateMinMaxRecordedValues();

      // if all data has been removed from the plot, update cursor visibility
      this.updateCursor();
    };

    // save to map so that listener can be found again for disposal
    this.dynamicSeriesListenerMap.set( dynamicSeries, dynamicSeriesListener );
    dynamicSeries.addDynamicSeriesListener( dynamicSeriesListener );
  }

  /**
   * Removes a DynamicSeries from the plot and disposes of its listener.
   * @override
   * @public
   *
   * @param {DynamicSeries} dynamicSeries - to remove
   */
  removeDynamicSeries( dynamicSeries ) {
    super.removeDynamicSeries( dynamicSeries );

    const seriesIndex = this.dynamicSeriesArray.indexOf( dynamicSeries );
    this.dynamicSeriesArray.splice( seriesIndex, 1 );

    dynamicSeries.removeDynamicSeriesListener( this.dynamicSeriesListenerMap.get( dynamicSeries ) );
    this.dynamicSeriesListenerMap.delete( dynamicSeries );
  }

  /**
   * Sets the cursor value. The value of the cursor is constrained to be within plot bounds.
   * @public
   *
   * @param {number} value
   */
  setCursorValue( value ) {
    const modelViewTransform = this.modelViewTransformProperty.get();
    const minX = modelViewTransform.viewToModelX( 0 );
    const maxX = modelViewTransform.viewToModelX( this.chartWidth + this.chartCursor.width / 2 );
    this.cursorValue = Utils.clamp( value, minX, maxX );
    this.updateCursor();
  }

  /**
   * Gets the value currently under the cursor.
   * @public
   *
   * @returns {number}
   */
  getCursorValue() {
    return this.cursorValue;
  }

  /**
   * Resets the cursor.
   * @public
   */
  resetCursor() {
    this.chartCursor.reset();
  }

  /**
   * Overrides the default behavior for setting cursor visibility. If set to null, cursor visibility will behave as
   * described in updateCursorVisibility. Otherwise, visibility will equal the boolean value set here.
   * @param {boolean|null} visible
   * @public
   */
  setCursorVisibleOverride( visible ) {
    assert && assert( typeof visible === 'boolean' || visible === null, 'visible must be boolean or null' );
    this._cursorVisibleOverride = visible;
    this.updateCursorVisibility();
  }

  /**
   * Updates the cursor visibility and position.
   * @private
   */
  updateCursor() {
    this.updateCursorVisibility();
    if ( this.chartCursor.isVisible() ) {
      this.updateCursorPosition();
    }
  }

  /**
   * Updates the cursor position.
   * @private
   */
  updateCursorPosition() {
    this.moveCursorToValue( this.cursorValue );
  }

  /**
   * Updates the cursor visibility. The cursor should be visible any time the cursor value is within
   * the recorded value range.
   * @private
   */
  updateCursorVisibility() {

    const wasVisible = this.chartCursor.visible;
    if ( typeof this._cursorVisibleOverride === 'boolean' ) {
      this.chartCursor.setVisible( this._cursorVisibleOverride );
    }
    else {

      const maxX = this.modelViewTransformProperty.get().viewToModelX( this.chartWidth + this.chartCursor.width / 2 );
      const minX = this.modelViewTransformProperty.get().viewToModelX( 0 );

      const isCurrentValueOnChart = ( this.cursorValue >= minX ) && ( this.cursorValue <= maxX );
      const hasData = this.hasData();
      const chartCursorVisible = isCurrentValueOnChart && hasData;

      this.chartCursor.setVisible( chartCursorVisible );
    }

    // if the cursor just became invisible, interrupt any active dragging
    if ( !this.chartCursor.visible && wasVisible ) {
      this.chartCursor.interruptDrag();
    }
  }

  /**
   * Returns true if any DynamicSeries associated with this chart has data.
   * @returns {boolean}
   * @public
   */
  hasData() {
    return _.some( this.dynamicSeriesArray, dynamicSeries => dynamicSeries.hasData() );
  }

  /**
   * Moves the cursor to the specified value.
   * @private
   *
   * @param {number} value
   */
  moveCursorToValue( value ) {
    const viewPosition = this.modelViewTransformProperty.get().modelToViewX( value );

    // keep the cursor within the grid bounds
    this.chartCursor.centerX = Utils.clamp( viewPosition, 0, this.chartWidth );
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
    this.dynamicSeriesArray.forEach( dynamicSeries => {
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
 * ChartCursor is a rectangular cursor that indicates the current or selected value on the chart.
 */
class ChartCursor extends Rectangle {

  /**
   * @param {XYCursorPlotNode} plot
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {Object} [options]
   */
  constructor( plot, modelViewTransformProperty, options ) {

    options = merge( {
      startDrag: () => {},
      endDrag: () => {},
      drag: () => {},

      // {boolean} - if true, a double headed arrow will be shown to indicate
      // that the cursor is draggable - becomes invisible after first
      // drag
      includeDragCue: false,

      // phet-io
      tandem: Tandem.OPTIONAL
    }, options );

    const width = plot.chartWidth * WIDTH_PROPORTION;
    const height = plot.chartHeight;

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

    this.includeDragCue = options.includeDragCue;

    if ( this.includeDragCue ) {

      // @private - indicates to the user that the cursor is draggable, only created
      // and added if necessary
      this.dragCueArrowNode = new ArrowNode( -width * 2, 0, width * 2, 0, {
        doubleHead: true,
        headWidth: 12,
        headHeight: 10,
        fill: ARROW_CUE_FILL_COLOR,
        stroke: ARROW_CUE_STROKE_COLOR,
        center: this.center.plusXY( 0, height * 0.4 )
      } );

      this.addChild( this.dragCueArrowNode );
    }

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

    // @private - so that we can interrupt the DragListener if necessary
    this.dragListener = new DragListener( {
      start: ( event, listener ) => {
        assert && assert( this.plot.hasData(), 'plot should have data for the cursor to be draggable' );
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

        // no need to show arrow after user successfully drags the cursor
        if ( this.includeDragCue ) {
          this.dragCueArrowNode.visible = false;
        }
      },
      tandem: options.tandem.createTandem( 'dragListener' )
    } );
    this.addInputListener( this.dragListener );
  }

  /**
   * Interrupts dragging of the cursor, useful when ChartCursor visibility changes.
   * @public
   */
  interruptDrag() {
    this.dragListener.interrupt();
  }

  /**
   * Resets the ChartCursor to its initial state. Note that this does not modify data
   * or the cursor position (cursorValue), only aspects of the view for the cursor itself.
   * @public
   */
  reset() {
    if ( this.includeDragCue ) {
      this.dragCueArrowNode.visible = true;
    }
  }
}

/**
 * GrippyIndentNode is a small round indentation on a surface.  This is a modern user interface paradigm that
 * is intended to convey the concept of "gripability", i.e. something that the user can grab.  This is meant to
 * look somewhat 3D, much like etched borders do.
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

griddle.register( 'XYCursorPlotNode', XYCursorPlotNode );
export default XYCursorPlotNode;