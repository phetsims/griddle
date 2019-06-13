// Copyright 2019, University of Colorado Boulder

/**
 * An XYPlot that includes as draggable cursor is included that allows the user to scrub or play back through the data.
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
      this.chartCursor = new ChartCursor( this, this.plotPath.width * WIDTH_PROPORTION, this.plotPath.height, options.cursorOptions );
      this.addChild( this.chartCursor );

      // initialize position and visibility of the cursor
      this.updateChartCursor();
    }

    /**
     * @param {XYDataSeries} series
     * @param {number} scaleFactor
     */
    addSeries( series, scaleFactor ) {
      super.addSeries( series, scaleFactor );

      // find the min and max recorded values for limiting the cursor
      // TODO: more efficient approach? Perhaps just do this on drag instead of on addition of data point?
      const seriesListener = ( x, y, previousX, previousY ) => {
        let minRecordedValue = Number.POSITIVE_INFINITY;
        let maxRecordedValue = Number.NEGATIVE_INFINITY;
        for ( let i = 0; i < series.dataSeriesLength; i++ ) {
          const seriesX = series.getX( i );
          if ( seriesX > maxRecordedValue ) {
            maxRecordedValue = seriesX;
          }
          if ( seriesX < minRecordedValue ) {
            minRecordedValue = seriesX;
          }
        }

        this.maxRecordedValue = maxRecordedValue;
        this.minRecordedValue = minRecordedValue;
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

    setCursorValue( value ) {
      this.cursorValue = value;
      this.updateChartCursor();
    }

    getCursorValue() {
      return this.cursorValue;
    }

    // @private - update the position of the chart cursor
    updateChartCursor() {
      this.updateChartCursorVisibility();
      if ( this.chartCursor.isVisible() ) {
        this.updateChartCursorPos();
      }
    }

    updateChartCursorPos() {
      const recordingStartValue = this.getMinRecordedValue();
      const recordingCurrentValue = this.cursorValue;
      this.moveChartCursorToValue( ( recordingCurrentValue - recordingStartValue ) );
    }

    updateChartCursorVisibility() {

      // Deciding whether or not the chart cursor should be visible is a little tricky, so I've tried to make the logic
      // very explicit for easier maintenance.  Basically, any time we are in playback mode and we are somewhere on the
      // chart, or when stepping and recording, the cursor should be seen.
      const valueOnChart = ( this.cursorValue - this.getMinRecordedValue() );
      const isCurrentValueOnChart = ( valueOnChart >= 0 ) && ( valueOnChart <= this.maxX );
      const dataExists = this.getDataExists();
      const chartCursorVisible = isCurrentValueOnChart && dataExists;
      this.chartCursor.setVisible( chartCursorVisible );
    }

    positionToValue( position ) {
      return position * ( this.maxX - this.minX ) / this.plotPath.width;
    }

    valueToPosition( value ) {
      return value * this.plotPath.width / ( this.maxX - this.minX );
    }

    moveChartCursorToValue( value ) {

      // origin of cursor is at center top
      const xPosition = value * this.plotPath.width / ( this.maxX - this.minX );
      this.chartCursor.x = Util.clamp( xPosition, 0, this.plotPath.width );
      this.chartCursor.y = this.plotPath.top;
    }

    getMinRecordedValue() {
      return this.dataSeriesList.length === 0 ? 0 : this.minRecordedValue;
    }

    getMaxRecordedValue() {
      return this.dataSeriesList.length === 0 ? 0 : this.maxRecordedValue;
    }

    // TODO: Again,  need to inspect the series attached to this plot to determine if any data exists
    getDataExists() {
      return true;
      // this.dataSeries.getLength() > 0
    }

  }

  class ChartCursor extends Rectangle {
    constructor( plot, width, height, options ) {

      options = _.extend( {
        startDrag: () => {},
        endDrag: () => {},

        // phet-io
        tandem: Tandem.optional
      }, options );

      // Set the shape. Origin is at the center top of the rectangle.

      super( -width / 2, 0, width, height, 0, 0, {
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
      const indentSpacing = 0.05 * height;
      const grippyIndent1 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
      grippyIndent1.translate( 0, height / 2 - indentSpacing );
      this.addChild( grippyIndent1 );
      const grippyIndent2 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
      grippyIndent2.translate( 0, height / 2 );
      this.addChild( grippyIndent2 );
      const grippyIndent3 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
      grippyIndent3.translate( 0, height / 2 + indentSpacing );
      this.addChild( grippyIndent3 );

      const dragListener = new DragListener( {
        start: ( event, listener ) => {
          options.startDrag();
        },
        drag: ( event, listener ) => {
          const parentX = listener.parentPoint.x;
          let newValue = this.plot.positionToValue( parentX );

          // limit cursor to 
          newValue = Util.clamp( newValue, plot.getMinRecordedValue(), plot.getMaxRecordedValue() );
          this.plot.setCursorValue( newValue );
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