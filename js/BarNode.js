// Copyright 2017, University of Colorado Boulder

/**
 * Represents a bar in a bar chart for a specific set of composite values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Util = require( 'DOT/Util' );

  /**
   * @constructor
   *
   * NOTE: This is provided in the "mathematical" coordinate frame, where +y is up. For visual handling, rotate it by
   * Math.PI.
   *
   * NOTE: update() should be called between when the bars change and a Display.updateDisplay(). This node does not
   * otherwise update its view.
   *
   * @param {Array.<Object>} barEntries - Objects of the type { property: {Property.<number>}, color: {paint} }
   * @param {Property.<Range>} totalRangeProperty - Range of visual values displayed (note negative values for min are
   *                           supported).
   * @param {Object} [options]
   */
  function BarNode( barEntries, totalRangeProperty, options ) {
    assert && assert( barEntries.length > 0 );

    options = _.extend( {
      // {paint} - The color of the border (along the sides and top of the bar)
      borderColor: 'black',

      // {number} - Width of the border (along the sides and top of the bar)
      borderWidth: 1,

      // {number} - The visual width of the bar (excluding the stroke)
      barWidth: 15,

      // {boolean} - Whether off-scale arrows should be shown
      showOffScaleArrow: true,

      // {paint} - Fill for the off-scale arrows
      offScaleArrowFill: '#bbb',

      // {number} - Distance between the top of a bar and the bottom of the off-scale arrow
      offScaleArrowOffset: 5,

      // {paint} - If any of the bar properties are negative (and this is non-null) and we have multiple bars, this
      // color will be used instead.
      invalidBarColor: 'gray',

      // {Property.<number>} - If provided, the given entries' values will be scaled by this number before display.
      scaleProperty: new NumberProperty( 1 )
    }, options );

    // @private {Array.<BarProperty>}
    this.barEntries = barEntries;

    // @private {Property.<Range>}
    this.totalRangeProperty = totalRangeProperty;

    // @private
    this.borderWidth = options.borderWidth;
    this.scaleProperty = options.scaleProperty;
    this.showOffScaleArrow = options.showOffScaleArrow;
    this.offScaleArrowOffset = options.offScaleArrowOffset;
    this.invalidBarColor = options.invalidBarColor;

    // @private {Array.<Rectangle>}
    this.bars = this.barEntries.map( function( barEntry ) {
      return new Rectangle( 0, 0, options.barWidth, 0, {
        centerX: 0
      } );
    } );

    // @private {Rectangle}
    this.borderRectangle = new Rectangle( 0, 0, options.barWidth + 2 * options.borderWidth, 0, {
      fill: options.borderColor,
      centerX: 0
    } );

    // @private {ArrowNode}
    this.offScaleArrow = new ArrowNode( 0, 0, 0, options.barWidth, {
      fill: options.offScaleArrowFill,
      stroke: 'black',
      headHeight: options.barWidth / 2,
      headWidth: options.barWidth,
      tailWidth: options.barWidth * 3 / 5,
      centerX: 0
    } );

    var children = [ this.borderRectangle ].concat( this.bars );
    if ( options.showOffScaleArrow ) {
      children.push( this.offScaleArrow );
    }
    options.children = children;

    Node.call( this, options );

    this.update();
  }

  griddle.register( 'BarNode', BarNode );

  /**
   * Sets a rectangle's y and height such that it goes between the two y values given.
   *
   * @param {Rectangle} rectangle
   * @param {number} y1
   * @param {number} y2
   */
  function setBarYValues( rectangle, y1, y2 ) {
    rectangle.rectY = Math.min( y1, y2 );
    rectangle.rectHeight = Math.abs( y1 - y2 );
  }

  return inherit( Node, BarNode, {
    /**
     * Updates all of the bars to the correct values.
     * @public
     */
    update: function() {
      var i;
      var scale = this.scaleProperty.value;

      // How much of our "range" we need to take away, to be able to show an out-of-scale arrow.
      var arrowPadding = this.offScaleArrow.height + this.offScaleArrowOffset;

      // How far our actual bar rectangles can go (minimum and maximum). If our bars reach this limit (on either side),
      // an off-scale arrow will be shown.
      var effectiveRange = this.totalRangeProperty.value;

      // Reduce the effective range to compensate with the borderWidth, so we don't overshoot the range.
      effectiveRange = new Range( effectiveRange.min < 0 ? effectiveRange.min + this.borderWidth : effectiveRange.min, effectiveRange.max - this.borderWidth );
      if ( this.showOffScaleArrow ) {
        effectiveRange = new Range( effectiveRange.min < 0 ? effectiveRange.min + arrowPadding : effectiveRange.min,
                                    effectiveRange.max - arrowPadding );
      }

      // Total (scaled) sum of values for all bars
      var total = 0;

      // Whether we have any negative-value bars
      var hasNegative = false;

      // Check for whether we have an "invalid bar" case with the total and hasNegative
      for ( i = 0; i < this.barEntries.length; i++ ) {
        var value = this.barEntries[ i ].property.value * scale;
        if ( value < 0 ) {
          hasNegative = true;
        }
        total += value;
      }

      // Start with the first bar at the origin.
      var currentY = 0;

      // When we have an "invalid bar" case (one negative with multiple values), we just use the first bar to display
      // the range, and hide all of the other bars.
      if ( hasNegative && this.barEntries.length > 1 ) {
        currentY = effectiveRange.constrainValue( total );

        var firstBar = this.bars[ 0 ];
        firstBar.fill = this.invalidBarColor;
        setBarYValues( firstBar, 0, currentY );
        firstBar.visible = true;

        // Hide the other bars
        for ( i = 1; i < this.barEntries.length; i++ ) {
          this.bars[ i ].visible = false;
        }
      }
      else {
        for ( i = 0; i < this.barEntries.length; i++ ) {
          var barEntry = this.barEntries[ i ];
          var bar = this.bars[ i ];
          bar.fill = barEntry.color;

          var barValue = barEntry.property.value * scale;

          // The bar would be displayed between currentY and nextY
          var nextY = effectiveRange.constrainValue( currentY + barValue );
          if ( nextY !== currentY ) {
            setBarYValues( bar, currentY, nextY );
            bar.visible = true;
          }
          else {
            bar.visible = false;
          }
          currentY = nextY;
        }
      }

      // Off-scale arrow visible on the top (max)
      if ( currentY === effectiveRange.max ) {
        this.offScaleArrow.visible = true;
        this.offScaleArrow.rotation = 0;
        this.offScaleArrow.y = effectiveRange.max + this.offScaleArrowOffset; // mathematical top
      }
      // Off-scale arrow visible on the bottom (min)
      else if ( currentY === effectiveRange.min && currentY < 0 ) {
        this.offScaleArrow.visible = true;
        this.offScaleArrow.rotation = Math.PI;
        this.offScaleArrow.y = effectiveRange.min - this.offScaleArrowOffset; // mathematical bottom
      }
      // No off-scale arrow visible
      else {
        this.offScaleArrow.visible = false;
      }

      setBarYValues( this.borderRectangle, 0, currentY + this.borderWidth * Util.sign( currentY ) );
      this.borderRectangle.visible = currentY !== 0;
    }
  } );
} );
