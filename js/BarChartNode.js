// Copyright 2014-2017, University of Colorado Boulder

/**
 * Bar chart for sims that need to display separate values
 *
 * TODO: Add horizontal support
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var BarNode = require( 'GRIDDLE/BarNode' );
  var griddle = require( 'GRIDDLE/griddle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @constructor
   *
   * NOTE: update() should be called manually to update the view of this Node. For performance, it doesn't update on
   * every change.
   *
   * @param {Array.<Object>} bars - Entries of the format:
   *   {
   *     entries: {Array.<{ property: {Property.<number>}, color: {paint} }>}
   *     [label]: {Node},
   *     [offScaleArrowFill]: {paint} - If provided, allows bar-specific arrow fills (that are different than the color)
   *   }
   * @param {Property.<Range>} rangeProperty
   * @param {Object} [options]
   */
  function BarChartNode( bars, rangeProperty, options ) {
    Node.call( this );

    var self = this;

    options = _.extend( {
      // {number} - Space in-between each bar
      barSpacing: 13,

      // provided to the x-axis Line
      xAxisOptions: {
        stroke: 'black',
        lineWidth: 1,

        minPadding: 12,
        maxExtension: 10
      },

      barOptions: {
        // See BarNode's options.
      }
    }, options );

    // @private {Array.<Object>}
    this.bars = bars;

    // For vertical orientation
    options.barOptions = _.extend( {}, options.barOptions, {
      rotation: Math.PI
    } );

    // @private {Array.<BarNode>}
    this.barNodes = bars.map( function( bar ) {
      assert && assert( bar.entries && bar.entries instanceof Array );
      var barOptions = _.extend( {
        offScaleArrowFill: bar.offScaleArrowFill === undefined ? ( bar.entries.length > 1 ? '#bbb' : bar.entries[ 0 ].color ) : bar.offScaleArrowFill
      }, options.barOptions );
      return new BarNode( bar.entries, rangeProperty, barOptions );
    } );

    var barBox = new HBox( {
      spacing: options.barSpacing,
      align: 'origin',
      children: this.barNodes
    } );
    this.addChild( barBox );

    var xAxis = new Line( -options.xAxisOptions.minPadding, 0, barBox.width + options.xAxisOptions.maxExtension, 0, options.xAxisOptions );
    this.addChild( xAxis );

    var yAxis = new ArrowNode( 0, 0, 0, -rangeProperty.value.max, {
      tailWidth: 2,
      headHeight: 7,
      headWidth: 6
    } );
    rangeProperty.link( function( range ) {
      yAxis.setTailAndTip( -options.xAxisOptions.minPadding, 0, -options.xAxisOptions.minPadding, -range.max );
    } );
    this.addChild( yAxis );

    // Update localBounds to the correct value
    rangeProperty.link( function( range ) {
      self.localBounds = self.localBounds.withMinY( Math.min( yAxis.bottom, -range.max ) )
                                         .withMaxY( Math.max( options.xAxisOptions.lineWidth / 2, -range.min ) );
    } );

    this.mutate( options );
  }

  griddle.register( 'BarChartNode', BarChartNode );

  return inherit( Node, BarChartNode, {
    /**
     * Updates all of the bar nodes.
     * @public
     */
    update: function() {
      for ( var i = 0; i < this.barNodes.length; i++ ) {
        this.barNodes[ i ].update();
      }
    }
  } );
} );
