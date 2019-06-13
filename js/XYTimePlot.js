// Copyright 2019, University of Colorado Boulder

/**
 * An XYPlot that is intended to plot data against time. A draggable cursor is included that allows the user to scrub
 * or playback in time.
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

  class XYTimePlot extends XYPlot {

    constructor( options ) {

      options = _.extend( {

        // options passed on to the chart cursor, see ChartCursor
        cursorOptions: null,

        // phet-io
        tandem: Tandem.optional
      }, options );

      super( options );

      // {number} - time for the cursor in seconds, impacts positioning
      this.cursorTime = 0;

      // @private - minimum and maximum recorded time, required by the cursor to limit dragging
      this.minRecordedTime = 0;
      this.maxRecordedTime = 0;

      // maps XYDataSeries.uniqueId to a listener required by XYTimePlot so that it can be removed if the series
      // is removed.
      // TODO: This can be replaced by an actual Map when we can use them
      this.timeSeriesListenerMap = {};

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

      // find the min and max recorded times for limiting the cursor
      // TODO: more efficient approach? Perhaps just do this on drag instead of on addition of data point?
      const seriesListener = ( x, y, previousX, previousY ) => {
        let minRecordedTime = Number.POSITIVE_INFINITY;
        let maxRecordedTime = Number.NEGATIVE_INFINITY;
        for ( let i = 0; i < series.dataSeriesLength; i++ ) {
          const seriesX = series.getX( i );
          if ( seriesX > maxRecordedTime ) {
            maxRecordedTime = seriesX;
          }
          if ( seriesX < minRecordedTime ) {
            minRecordedTime = seriesX;
          }
        }

        this.maxRecordedTime = maxRecordedTime;
        this.minRecordedTime = minRecordedTime;
      };

      // save to map so that listener can be found again for disposal
      this.timeSeriesListenerMap[ series.uniqueId ] = seriesListener;
      series.addDataSeriesListener( seriesListener );
    }

    /**
     * Remove a series from the plot and dispose of the time plot specific series listener.
     * @public
     *
     * @param {XYDataSeries} series - to remove
     */
    removeSeries( series ) {
      series.removeDataSeriesListener( this.timeSeriesListenerMap[ series.uniqueId ] );
      delete this.timeSeriesListenerMap[ series.uniqueId ];

      super.removeSeries( series );
    }

    setCursorTime( time ) {
      this.cursorTime = time;
      this.updateChartCursor();
    }

    getCursorTime() {
      return this.cursorTime;
    }

    // @private - update the position of the chart cursor
    updateChartCursor() {
      this.updateChartCursorVisibility();
      if ( this.chartCursor.isVisible() ) {
        this.updateChartCursorPos();
      }
    }

    updateChartCursorPos() {
      const recordingStartTime = this.getMinRecordedTime();
      const recordingCurrentTime = this.cursorTime;
      this.moveChartCursorToTime( ( recordingCurrentTime - recordingStartTime ) );
    }

    updateChartCursorVisibility() {

      // Deciding whether or not the chart cursor should be visible is a little tricky, so I've tried to make the logic
      // very explicit for easier maintenance.  Basically, any time we are in playback mode and we are somewhere on the
      // chart, or when stepping and recording, the cursor should be seen.
      const timeOnChart = ( this.cursorTime - this.getMinRecordedTime() );
      const isCurrentTimeOnChart = ( timeOnChart >= 0 ) && ( timeOnChart <= this.maxX );
      const dataExists = this.getDataExists();
      const chartCursorVisible = isCurrentTimeOnChart && dataExists;
      this.chartCursor.setVisible( chartCursorVisible );
    }

    positionToTime( position ) {
      return position * ( this.maxX - this.minX ) / this.plotPath.width;
    }

    timeToPosition( time ) {
      return time * this.plotPath.width / ( this.maxX - this.minX );
    }

    moveChartCursorToTime( time ) {

      // origin of cursor is at center top
      const xPosition = time * this.plotPath.width / ( this.maxX - this.minX );
      this.chartCursor.x = Util.clamp( xPosition, 0, this.plotPath.width );
      this.chartCursor.y = this.plotPath.top;
    }

    // TODO: In neuron, it was important to return 0 or the minimum recorded time if any data exists...how to do that
    // here? This is called frequently, so it must be efficient.
    // in seconds
    getMinRecordedTime() {
      return this.dataSeriesList.length === 0 ? 0 : this.minRecordedTime;
    }

    getMaxRecordedTime() {
      return this.dataSeriesList.length === 0 ? 0 : this.maxRecordedTime;
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
          let newTime = this.plot.positionToTime( parentX );

          // limit cursor to 
          newTime = Util.clamp( newTime, plot.getMinRecordedTime(), plot.getMaxRecordedTime() );

          this.plot.setCursorTime( newTime );
        },
        end: ( event, liistener ) => {
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

  return griddle.register( 'XYTimePlot', XYTimePlot );
} );