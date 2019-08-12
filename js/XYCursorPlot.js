// Copyright 2019, University of Colorado Boulder

/**
 * An XYPlot that includes a draggable cursor that allows the user to scrub or play back through the data.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Color = require( 'SCENERY/util/Color' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const griddle = require( 'GRIDDLE/griddle' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Util = require( 'DOT/Util' );
  const XYPlot = require( 'GRIDDLE/XYPlot' );

  // constants
  const WIDTH_PROPORTION = 0.013; // empirically determined
  const CURSOR_FILL_COLOR = new Color( 50, 50, 200, 0.2 );
  const CURSOR_STROKE_COLOR = Color.DARK_GRAY;

  class XYCursorPlot extends XYPlot {

    constructor( options ) {

      options = _.extend( {

        // options passed on to the chart cursor, see ChartCursor
        cursorOptions: null,

        // phet-io
        tandem: Tandem.optional
      }, options );

      super( options );

      // @private {boolean|null} - if set with setCursorVisible, then this will indicate visibility of the cursor
      this._cursorVisibleOverride = null;

      // {number} - value for the cursor, determines cursor positioning
      this.cursorValue = 0;

      // @private - minimum and maximum recorded value, required by the cursor to limit dragging
      this.minRecordedValue = 0;
      this.maxRecordedValue = 0;

      // maps XYDataSeries.uniqueId to a listener required by XYCursorPlot so that it can be removed if the series
      // is removed.
      // TODO: This can be replaced by an actual Map when we can use them
      this.valueSeriesListenerMap = {};

      // @private
      this.chartCursor = new ChartCursor( this, options.cursorOptions );
      this.addChild( this.chartCursor );

      // initialize position and visibility of the cursor
      this.updateChartCursor();
    }

    /**
     * Add a series to the plot, first adding a listener that keeps track of minimum and maximum data values.
     *
     * @param {XYDataSeries} series
     * @param {number} scaleFactor
     */
    addSeries( series, scaleFactor ) {
      super.addSeries( series, scaleFactor );

      // when a point is added, update the min and max recorded values
      const seriesListener = ( x, y, previousX, previousY ) => {

        // update min/max domain of the plotted data
        this.updateMinMaxXValues();

        // if all data has been removed from the plot, update cursor visibility
        this.updateChartCursor();
      };

      // save to map so that listener can be found again for disposal
      this.valueSeriesListenerMap[ series.uniqueId ] = seriesListener;
      series.addDataSeriesListener( seriesListener );
    }

    /**
     * Remove a series from the plot and dispose of the plot specific series listener.
     * @public
     *
     * @param {XYDataSeries} series - to remove
     */
    removeSeries( series ) {
      series.removeDataSeriesListener( this.valueSeriesListenerMap[ series.uniqueId ] );
      delete this.valueSeriesListenerMap[ series.uniqueId ];

      super.removeSeries( series );
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
     */
    setCursorVisibleOverride( visible ) {
      assert && assert( typeof visible === 'boolean' || visible === null, '' );
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
      const recordingStartValue = this.getMinRecordedValue();
      const recordingCurrentValue = this.cursorValue;
      this.moveChartCursorToValue( ( recordingCurrentValue - recordingStartValue ) );
    }

    /**
     * Update the chart cursor visibility. The chart cursor should be visible any time the cursor value is within
     * the recorded value range.
     *
     * @private
     */
    updateChartCursorVisibility() {
      if ( typeof this._cursorVisibleOverride === 'boolean' ) {
        this.chartCursor.setVisible( this._cursorVisibleOverride );
      }
      else {
        const valueOnChart = ( this.cursorValue - this.getMinRecordedValue() );
        const isCurrentValueOnChart = ( valueOnChart >= 0 ) && ( valueOnChart <= this.maxX );
        const dataExists = this.getDataExists();
        const chartCursorVisible = isCurrentValueOnChart && dataExists;
        this.chartCursor.setVisible( chartCursorVisible );
      }
    }

    /**
     * Get the chart value for the given position in view coordinates, relative tot the parent coordinate frame.
     * @private
     *
     * @param {number} position
     * @returns {number}
     */
    positionToValue( position ) {
      return position * ( this.maxX - this.minX ) / this.plotPath.width;
    }

    /**
     * Get the position on the chart from the provided value.
     * @private
     *
     * @param {number} value
     * @returns {number}
     */
    valueToPosition( value ) {
      return value * this.plotPath.width / ( this.maxX - this.minX );
    }

    /**
     * Move the chart cursor to the specified value.
     * @private
     *
     * @param {number} value
     */
    moveChartCursorToValue( value ) {

      // origin of cursor is at the center
      const xPosition = value * this.plotPath.width / ( this.maxX - this.minX );
      this.chartCursor.centerX = Util.clamp( xPosition, 0, this.plotPath.width );
      this.chartCursor.centerY = this.plotPath.centerY;
    }

    /**
     * Get the minimum X data value in the data series lists. Returns zero if no data has been added yet. This value
     * is updated whenever data is added to the list.
     *
     * @returns {number}
     */
    getMinRecordedValue() {
      return !this.getDataExists() ? 0 : this.minRecordedValue;
    }

    /**
     * Get the maximum X data value in the data series lists. Returns zero if no data has been added yet.  This value
     * is updated whenever data is added to the data series list.
     *
     * @returns {number}
     */
    getMaxRecordedValue() {
      return !this.getDataExists() ? 0 : this.maxRecordedValue;
    }

    /**
     * Returns true if any data is attached to this plot.
     * @public
     *
     * @returns {boolean}
     */
    getDataExists() {
      let dataExists = false;
      for ( let i = 0; i < this.dataSeriesList.length; i++ ) {

        // dataSeriesList[ i ].length is always greater than zero (pre-allocated for performance), check tracked value
        if ( this.dataSeriesList[ i ].dataSeriesLength > 0 ) {
          dataExists = true;
          break;
        }
      }

      return dataExists;
    }

    /**
     * Update the minimum/maximum plotted domain of the data recorded on this plot. This information is used
     * to determine selected cursor values. If no data is associated with this plot, extrema are represented by
     * min = infinity, max = negative infinity.
     *
     * @private
     */
    updateMinMaxXValues() {
      this.minRecordedValue = Number.POSITIVE_INFINITY;
      this.maxRecordedValue = Number.NEGATIVE_INFINITY;
      for ( let i = 0; i < this.dataSeriesList.length; i++ ) {
        const dataSeries = this.dataSeriesList[ i ];
        for ( let j = 0; j < dataSeries.dataSeriesLength; j++ ) {
          const xValue = dataSeries.getX( j );

          if ( xValue > this.maxRecordedValue ) {
            this.maxRecordedValue = xValue;
          }
          if ( xValue < this.minRecordedValue ) {
            this.minRecordedValue = xValue;
          }
        }
      }
    }
  }

  /**
   * Rectangular cursor that indicates a current or selected value on the chart.
   */
  class ChartCursor extends Rectangle {

    /**
     * @param {XYPlot} plot
     * @param {number} options
     */
    constructor( plot, options ) {

      options = _.extend( {
        startDrag: () => {},
        endDrag: () => {},
        drag: () => {},

        // phet-io
        tandem: Tandem.optional
      }, options );

      const width = plot.plotPath.width * WIDTH_PROPORTION;
      const height = plot.plotPath.height;

      // Set the shape. Origin is at the center top of the rectangle.
      super( 0, -height, width, height, 0, 0, {
        cursor: 'e-resize',
        fill: CURSOR_FILL_COLOR,
        stroke: CURSOR_STROKE_COLOR,
        lineWidth: 0.4,
        lineDash: [ 4, 4 ]
      } );

      this.plot = plot;

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
          let newValue = this.plot.positionToValue( parentX );

          // limit cursor to the domain of recorded values
          newValue = Util.clamp( newValue, plot.getMinRecordedValue(), plot.getMaxRecordedValue() );
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
     * @param {object} options
     */
    constructor( diameter, baseColor, options ) {

      options =  _.extend( {
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

  return griddle.register( 'XYCursorPlot', XYCursorPlot );
} );