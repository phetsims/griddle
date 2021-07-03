// Copyright 2020-2021, University of Colorado Boulder

/**
 * A XYChartNode which is set up to behave like a Seismograph. The modelViewTransform for this chart
 * is set such that data streams onto the chart from the right side. The default size is currently small so that
 * it can fit into a small draggable sensor, like the ones in Wave Interference, Bending Light, Circuit Construction
 * Kit: AC. IT is typicall embedded in a Panel.
 *
 * Please see the demo in http://localhost/griddle/griddle_en.html
 *
 * @author Jesse Greenberg
 *
 * @deprecated - please use bamboo
 */

import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Range from '../../dot/js/Range.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import merge from '../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import Tandem from '../../tandem/js/Tandem.js';
import griddle from './griddle.js';
import XYChartNode from './XYChartNode.js';
import SeismographDynamicSeriesNode from './SeismographDynamicSeriesNode.js';
import SpanNode from './SpanNode.js';

// constants
const HORIZONTAL_AXIS_LABEL_MARGIN = 4;

class SeismographNode extends XYChartNode {

  /**
   * @param {NumberProperty} valueProperty - value along the horizontal axis, in model units
   * @param {DynamicSeries[]} dynamicSeriesArray - data to be plotted
   * @param spanLabelNode - label Node for the span, indicating units of value
   * @param options
   */
  constructor( valueProperty, dynamicSeriesArray, spanLabelNode, options ) {
    assert && deprecationWarning( 'Please use bamboo' );

    // the grid for a seismograph does not scroll with the data, so it will get its own transform (set below)
    const gridTransformProperty = new Property( ModelViewTransform2.createIdentity() );

    options = merge( {

      // {Range[]} - If there is more than one specified vertical range, zoom buttons are displayed - in model coordinates
      verticalRanges: [ new Range( -1, 1 ) ],

      // {number} - index of verticalRanges above to initially use
      initialVerticalRangeIndex: 0,

      verticalRangeProperty: new Property( new Range( -1, 1 ) ),
      horizontalRangeProperty: new Property( new Range( 0, 4 ) ),

      // number of grid lines in the seismograph, including lines along the min and max (edges of the chart)
      numberHorizontalLines: 5,
      numberVerticalLines: 5,

      // {Node} - label for the horizontal axis, layout adjusted to accommodate the span Node of the Seismograph,
      // otherwise passed to supertype
      horizontalAxisLabelNode: null,

      // {boolean} - by default, there are no horizontal labels for the SeismographNode
      showHorizontalGridLabels: false,

      // {boolean} - if true, the GridNode will scroll with the data
      scrollGridNode: false,

      gridLabelOptions: {
        fill: 'white'
      },

      // passed along to the GridNode of XYChartNode
      gridNodeOptions: {
        majorLineOptions: {
          stroke: 'lightGray',
          lineDash: [ 5, 5 ],
          lineWidth: 0.8,
          lineDashOffset: 5 / 2
        }
      },

      // right margin of the chart, gives room for the "pen" of the DynamicSeriesNode
      rightMargin: 10,

      tandem: Tandem.OPTIONAL
    }, options );

    assert && assert( options.modelViewTransformProperty === undefined, 'SeismographNode sets ModelViewTransform' );
    assert && assert( options.verticalRanges.length === 1, 'SeismographNode is deprecated and no longer supports multiple vertical ranges, please use bamboo' );
    assert && assert( options.gridNodeOptions.modelViewTransformProperty === undefined, 'SeismographNode sets transform for GridNode' );
    options.gridNodeOptions.modelViewTransformProperty = gridTransformProperty;

    super( options );

    // @private {number} - margin for the 'pen' circle on the seismograph
    this.rightMargin = options.rightMargin;

    // @public (listen-only)
    this.verticalRangeProperty = options.verticalRangeProperty;
    this.horizontalRangeProperty = options.horizontalRangeProperty;

    this.addDynamicSeriesArray( dynamicSeriesArray );

    const zoomLevelIndexProperty = new Property( options.initialVerticalRangeIndex, {
      isValidValue: v => v >= 0 && v < options.verticalRanges.length
    } );

    const zoomListener = zoomLevelIndex => {
      this.verticalRangeProperty.set( options.verticalRanges[ zoomLevelIndex ] );
    };
    zoomLevelIndexProperty.link( zoomListener );

    const widthWithMargin = this.chartWidth - options.rightMargin;

    // update the transform if vertical ranges change
    const dataMappingLink = Property.multilink( [ valueProperty, this.verticalRangeProperty ], ( value, verticalRange ) => {
      const transform = ModelViewTransform2.createRectangleInvertedYMapping(
        new Bounds2( value - 4, verticalRange.min, value, verticalRange.max ),
        new Bounds2( 0, 0, widthWithMargin, this.chartHeight )
      );
      this.modelViewTransformProperty.set( transform );

      if ( options.scrollGridNode ) {

        // if scrolling the GridNode, it receives the same transform as the chart
        gridTransformProperty.set( transform );
      }
      else {

        // if grid isn't scrolling don't pan it with value variable, but still transform with vertical range
        const newTransform = ModelViewTransform2.createRectangleInvertedYMapping(
          new Bounds2( 0, verticalRange.min, 4, verticalRange.max ),
          new Bounds2( 0, 0, widthWithMargin, this.chartHeight )
        );

        // only redraw if vertical range has changed
        if ( !newTransform.matrix.equals( gridTransformProperty.get().matrix ) ) {
          gridTransformProperty.set( newTransform );
        }
      }
    } );

    const viewSpanWidth = gridTransformProperty.get().modelToViewDeltaX( this.majorVerticalLineSpacing );
    const spanNode = new SpanNode( spanLabelNode, viewSpanWidth, {
      left: this.chartPanel.left,
      top: this.chartPanel.bottom + 2
    } );

    // make sure the horizontal label doesn't overlap with the spanNode
    if ( options.horizontalAxisLabelNode ) {
      if ( options.horizontalAxisLabelNode.left < spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN ) {
        options.horizontalAxisLabelNode.left = spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN;
        options.horizontalAxisLabelNode.maxWidth = this.chartWidth - spanNode.width - HORIZONTAL_AXIS_LABEL_MARGIN;
      }
    }

    this.addChild( spanNode );

    this.verticalRangeProperty.link( verticalRange => {
      const majorHorizontalLineSpacing = ( verticalRange.getLength() ) / ( options.numberHorizontalLines - 1 );
      const majorVerticalLineSpacing = this.horizontalRangeProperty.get().getLength() / ( options.numberVerticalLines - 1 );
      this.setLineSpacings( {
        majorVerticalLineSpacing: majorVerticalLineSpacing,
        majorHorizontalLineSpacing: majorHorizontalLineSpacing
      } );
    } );

    // @private
    this.resetSeismographNode = () => {
      zoomLevelIndexProperty.reset();
    };

    // @private - called by dispose
    this.disposeSeismographNode = () => {
      zoomLevelIndexProperty.unlink( zoomListener );
      Property.unmultilink( dataMappingLink );
    };
  }

  /**
   * Adds a SeismographDynamicSeriesNode to represent the DynamicSeries.
   * @protected
   * @override
   *
   * @param {DynamicSeries} dynamicSeries
   */
  addDynamicSeries( dynamicSeries ) {
    const dynamicSeriesNode = new SeismographDynamicSeriesNode(
      dynamicSeries,
      this.chartWidth - this.rightMargin,
      new Bounds2( 0, 0, this.chartWidth, this.chartHeight ),
      this.modelViewTransformProperty
    );
    this.chartPanel.addChild( dynamicSeriesNode );
    this.scrollingChartNodeDisposeEmitter.addListener( () => dynamicSeriesNode.dispose() );
  }

  /**
   * @public - restore initial conditions
   */
  reset() {
    this.resetSeismographNode();
  }

  /**
   * @public
   */
  dispose() {
    this.disposeSeismographNode();
    super.dispose();
  }
}

griddle.register( 'SeismographNode', SeismographNode );

export default SeismographNode;