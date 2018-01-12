// Copyright 2017, University of Colorado Boulder

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
  var Color = require( 'SCENERY/util/Color' );
  var griddle = require( 'GRIDDLE/griddle' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
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
   *     [labelString]: {string} formatted for RichText
   *     [labelNode]: {node} displayed below the label string if the label string exist
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
      barSpacing: 12,

      // provided to the x-axis Line
      xAxisOptions: {
        stroke: 'black',
        lineWidth: 1,

        minPadding: 8,
        maxExtension: 5
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

    // @private {Array.<BarNode>} Initializing barNodes.
    this.barNodes = bars.map( function( bar ) {
      assert && assert( bar.entries && bar.entries instanceof Array );
      var barOptions = _.extend( {
        offScaleArrowFill: bar.offScaleArrowFill === undefined ? ( bar.entries.length > 1 ? '#bbb' : bar.entries[ 0 ].color ) : bar.offScaleArrowFill
      }, options.barOptions );
      return new BarNode( bar.entries, rangeProperty, barOptions );
    } );

    // @private {Array.<Node>}
    this.barLabelNodes = bars.map( function( bar ) {
      var barLabelVBox = new VBox( { spacing: 4 } );
      if ( bar.labelString ) {
        var labelText = new RichText( bar.labelString, {
          rotation: -Math.PI / 2,
          font: new PhetFont( { size: 12, weight: 'bold' } ),
          fill: bar.entries.length === 1 ? bar.entries[ 0 ].color : 'black'
          // maxWidth:40 // TODO: Standardize
        } );
        barLabelVBox.addChild( labelText );

        // The valueNode is a transparent background for each label. Used to make the label standout against bar if the bar falls beneath the x-Axis.
        var valueNode = new Panel( labelText, {
          stroke: null,
          fill: new Color( 255, 255, 255, 0 ),// put transparency in the color so that the children aren't transparent
          cornerRadius: 0,
          xMargin: 0,
          yMargin: 10
        } );
        self.barNodes.forEach( function( bar ) {
          valueNode.center = bar.center;
        } );
        // barLabelVBox.addChild( valueNode );
      }
      if ( bar.labelNode ) {
        barLabelVBox.addChild( bar.labelNode );
      }
      return barLabelVBox;
    } );

    // Adding barNodes into HBox
    var barBox = new HBox( {
      spacing: options.barSpacing,
      align: 'origin',
      children: this.barNodes
    } );

    // Adding barNode labels into Node.
    var labelBox = new Node( {
      children: this.barLabelNodes
    } );

    // Manual positioning of labels to match position of barNodes in HBox.
    for ( var i = 0; i < bars.length; i++ ) {
      labelBox.children[ i ].centerX = this.barNodes[ i ].centerX;
      labelBox.children[ i ].top = 5;
    }
    this.addChild( barBox );
    this.addChild( labelBox );

    // Initializing xAxis
    var xAxis = new Line( -options.xAxisOptions.minPadding, 0, barBox.width + options.xAxisOptions.maxExtension, 0, options.xAxisOptions );
    this.addChild( xAxis );

    // Initializing yAxis
    var yAxis = new ArrowNode( 0, 0, 0, -rangeProperty.value.max, {
      tailWidth: 0.5,
      headHeight: 9,
      headWidth: 8
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
