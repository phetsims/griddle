// Copyright 2017-2019, University of Colorado Boulder

/**
 * Bar chart for sims that need to display separate values
 *
 * TODO: Add horizontal support
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const BarNode = require( 'GRIDDLE/BarNode' );
  const Color = require( 'SCENERY/util/Color' );
  const griddle = require( 'GRIDDLE/griddle' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const VBox = require( 'SCENERY/nodes/VBox' );

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
      },

      // {*|null} - options for the bar RichText labels, see extended options below
      barLabelOptions: null,

      // {Color}  Color of the background behind the labels
      labelBackgroundColor: Color.TRANSPARENT
    }, options );

    // @private {Array.<Object>}
    this.bars = bars;

    // For vertical orientation
    options.barOptions = _.extend( {}, options.barOptions, {
      rotation: Math.PI
    } );

    // passed along to the RichText
    options.barLabelOptions = _.extend( {
      font: new PhetFont( { size: 12, weight: 'bold' } ),

      // good for vertical bars that are close to each other
      rotation: -Math.PI / 2,

      // chosen by inspection, good for short labels
      maxWidth: 40
    }, options.barLabelOptions );

    assert && assert( options.barLabelOptions.fill === undefined, 'label fill set by entries, see constructor' );

    // @private {Array.<BarNode>} Initializing barNodes.
    this.barNodes = bars.map( function( bar ) {
      assert && assert( bar.entries && Array.isArray( bar.entries ) );
      var barOptions = _.extend( {
        offScaleArrowFill: bar.offScaleArrowFill === undefined ? ( bar.entries.length > 1 ? '#bbb' : bar.entries[ 0 ].color ) : bar.offScaleArrowFill
      }, options.barOptions );
      return new BarNode( bar.entries, rangeProperty, barOptions );
    } );

    // @private {Array.<Node>}
    this.barLabelNodes = bars.map( function( bar ) {
      var barLabelVBox = new VBox( { spacing: 4 } );
      if ( bar.labelString ) {

        var labelText = new RichText( bar.labelString, _.extend( {}, options.barLabelOptions, {
          fill: bar.entries.length === 1 ? bar.entries[ 0 ].color : 'black'
        } ) );

        // The valuePanel is a transparent background for each label. Used to make the label standout against bar if the bar falls beneath the x-Axis.
        var valuePanel = new Panel( labelText, {
          stroke: null,
          fill: options.labelBackgroundColor, // put transparency in the color so that the children aren't transparent
          cornerRadius: 3,
          xMargin: 0,
          yMargin: 2
        } );
        barLabelVBox.addChild( valuePanel );
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
      // Checks if the labelBox's VBox has any children.
      if ( typeof( labelBox.children[ i ].children[ 0 ] ) !== 'undefined' ) {
        labelBox.children[ i ].centerX = this.barNodes[ i ].centerX;
        labelBox.children[ i ].top = 3;
      }
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
        .withMaxY( Math.max( options.xAxisOptions.lineWidth / 2, -range.min, labelBox.bottom ) );
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
