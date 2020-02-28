// Copyright 2017-2020, University of Colorado Boulder

/**
 * Bar chart for sims that need to display separate values. This chart is vertically aligned, with bars that represent
 * values within a specified range.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import ArrowNode from '../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import Line from '../../scenery/js/nodes/Line.js';
import Node from '../../scenery/js/nodes/Node.js';
import RichText from '../../scenery/js/nodes/RichText.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import Color from '../../scenery/js/util/Color.js';
import Panel from '../../sun/js/Panel.js';
import BarNode from './BarNode.js';
import griddle from './griddle.js';

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
  const self = this;
  options = merge( {

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
  options.barOptions = merge( {}, options.barOptions, {
    rotation: Math.PI
  } );

  // passed along to the RichText
  options.barLabelOptions = merge( {
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
    const barOptions = merge( {
      offScaleArrowFill: bar.offScaleArrowFill === undefined ? ( bar.entries.length > 1 ? '#bbb' : bar.entries[ 0 ].color ) : bar.offScaleArrowFill
    }, options.barOptions );
    return new BarNode( bar.entries, rangeProperty, barOptions );
  } );

  // @private {Array.<Node>}
  this.barLabelNodes = bars.map( function( bar ) {
    const barLabelVBox = new VBox( { spacing: 4 } );
    if ( bar.labelString ) {

      const labelText = new RichText( bar.labelString, merge( {}, options.barLabelOptions, {
        fill: bar.entries.length === 1 ? bar.entries[ 0 ].color : 'black'
      } ) );

      // Transparent background for each label, used to make the label standout against bar if the bar falls beneath the x-Axis.
      const valuePanel = new Panel( labelText, {
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
  const barBox = new HBox( {
    spacing: options.barSpacing,
    align: 'origin',
    children: this.barNodes
  } );

  // Adding barNode labels into Node.
  const labelBox = new Node( {
    children: this.barLabelNodes
  } );

  // Manual positioning of labels to match position of barNodes in HBox.
  for ( let i = 0; i < bars.length; i++ ) {

    // Checks if the labelBox's VBox has any children.
    if ( typeof ( labelBox.children[ i ].children[ 0 ] ) !== 'undefined' ) {
      labelBox.children[ i ].centerX = this.barNodes[ i ].centerX;
      labelBox.children[ i ].top = 3;
    }
  }
  this.addChild( barBox );
  this.addChild( labelBox );

  // Initializing xAxis
  const xAxis = new Line( -options.xAxisOptions.minPadding, 0, barBox.width + options.xAxisOptions.maxExtension, 0, options.xAxisOptions );
  this.addChild( xAxis );

  // Initializing yAxis
  const yAxis = new ArrowNode( 0, 0, 0, -rangeProperty.value.max, {
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

export default inherit( Node, BarChartNode, {
  /**
   * Updates all of the bar nodes.
   * @public
   */
  update: function() {
    for ( let i = 0; i < this.barNodes.length; i++ ) {
      this.barNodes[ i ].update();
    }
  }
} );