// Copyright 2020, University of Colorado Boulder

/**
 * A ScrollingChartNode which is set up to behave like a Seismograph. The modelViewTransform for this chart
 * is set such that data streams onto the plot from the right side. The default size is currently small so that
 * it can fit into a small draggable sensor, like the ones in Wave Interference, Bending Light, Circuit Construction
 * Kit: AC. IT is typicall embedded in a Panel.
 *
 * Please see the demo in http://localhost/griddle/griddle_en.html
 *
 * Moved from wave-interference repo to griddle repo on Wed, Aug 29, 2018. Seismograph specific components
 * moved out of ScrollingChartNode on 6/2/20.
 *
 * @author Jesse Greenberg
 */

import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Range from '../../dot/js/Range.js';
import merge from '../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import ZoomButton from '../../scenery-phet/js/buttons/ZoomButton.js';
import Tandem from '../../tandem/js/Tandem.js';
import griddle from './griddle.js';
import ScrollingChartNode from './ScrollingChartNode.js';
import SeismographDynamicSeriesNode from './SeismographDynamicSeriesNode.js';
import SpanNode from './SpanNode.js';

// constants
const HORIZONTAL_AXIS_LABEL_MARGIN = 4;

class SeismographNode extends ScrollingChartNode {

  /**
   * @param {NumberProperty} timeProperty - indicates passage of time in the model, in model units
   * @param {DynamicSeries[]} dynamicSeriesArray - data to be plotted
   * @param verticalAxisLabelNode - shown on the vertical axis (should already be rotated, if necessary)
   * @param horizontalAxisLabelNode - shown on the horizontal axis
   * @param spanLabelNode - label Node for the span, indicating units of time
   * @param options
   */
  constructor( timeProperty, dynamicSeriesArray, verticalAxisLabelNode, horizontalAxisLabelNode, spanLabelNode, options ) {

    // the grid for a seismograph does not scroll with the data, so it will get its own transform (set below)
    const gridTransformProperty = new Property( ModelViewTransform2.createIdentity() );

    options = merge( {

      // {Range[]} - If there is more than one specified vertical range, zoom buttons are displayed - in model coordinates
      verticalRanges: [ new Range( -1, 1 ) ],

      // {number} - index of verticalRanges above to initially use
      initialVerticalRangeIndex: 0,

      // number of grid lines in the seismograph, including lines along the min and max (edges of plot)
      numberHorizontalLines: 5,
      numberVerticalLines: 5,

      // {boolean} - if true, the GridNode will scroll with the data
      scrollGridNode: false,

      // passed along to the GridNode of ScrollingChartNode
      gridNodeOptions: {
        majorLineOptions: {
          stroke: 'lightGray',
          lineDash: [ 5, 5 ],
          lineWidth: 0.8,
          lineDashOffset: 5 / 2
        }
      },

      // gives room for the "pen" of the DynamicSeriesNode
      rightGraphMargin: 10,

      tandem: Tandem.OPTIONAL
    }, options );

    assert && assert( options.modelViewTransformProperty === undefined, 'SeismographNode sets ModelViewTransform' );

    assert && assert( options.gridNodeOptions.modelViewTransformProperty === undefined, 'SeismographNode sets transform for GridNode' );
    options.gridNodeOptions.modelViewTransformProperty = gridTransformProperty;

    super( timeProperty, dynamicSeriesArray, verticalAxisLabelNode, horizontalAxisLabelNode, options );

    const zoomLevelIndexProperty = new Property( options.initialVerticalRangeIndex, {
      isValidValue: v => v >= 0 && v < options.verticalRanges.length
    } );

    const zoomListener = zoomLevelIndex => {
      this.verticalRangeProperty.set( options.verticalRanges[ zoomLevelIndex ] );
    };
    zoomLevelIndexProperty.link( zoomListener );

    //
    const widthWithMargin = this.plotWidth - options.rightGraphMargin;

    // update the transform if vertical ranges change
    const dataMappingLink = Property.multilink( [ timeProperty, this.verticalRangeProperty ], ( time, verticalRange ) => {
      const transform = ModelViewTransform2.createRectangleInvertedYMapping(
        new Bounds2( time - 4, verticalRange.min, time, verticalRange.max ),
        new Bounds2( 0, 0, widthWithMargin, this.plotHeight )
      );
      this.modelViewTransformProperty.set( transform );

      if ( options.scrollGridNode ) {

        // if scrolling the GridNode, it receives the same transform as the chart
        gridTransformProperty.set( transform );
      }
      else {

        // if grid isn't scrolling don't pan it with time variable, but still transform with vertical range
        gridTransformProperty.set( ModelViewTransform2.createRectangleInvertedYMapping(
          new Bounds2( 0, verticalRange.min, 4, verticalRange.max ),
          new Bounds2( 0, 0, widthWithMargin, this.plotHeight )
        ) );
      }
    } );

    if ( options.verticalRanges.length > 1 ) {
      const zoomButtonOptions = {
        left: this.graphPanel.right + 5,
        baseColor: '#97c7fa',
        radius: 6,
        xMargin: 5,
        yMargin: 3
      };

      const zoomInButton = new ZoomButton( merge( {
        in: true,
        top: this.graphPanel.top,
        listener: () => zoomLevelIndexProperty.value--,
        tandem: options.tandem.createTandem( 'zoomInButton' )
      }, zoomButtonOptions ) );
      this.addChild( zoomInButton );

      const zoomOutButton = new ZoomButton( merge( {
        in: false,
        top: zoomInButton.bottom + 5,
        listener: () => zoomLevelIndexProperty.value++,
        tandem: options.tandem.createTandem( 'zoomOutButton' )
      }, zoomButtonOptions ) );
      this.addChild( zoomOutButton );

      zoomLevelIndexProperty.link( zoomLevelIndex => {
        zoomOutButton.enabled = zoomLevelIndex < options.verticalRanges.length - 1;
        zoomInButton.enabled = zoomLevelIndex > 0;
      } );
    }

    const viewSpanWidth = gridTransformProperty.get().modelToViewDeltaX( this.majorVerticalLineSpacing );
    const spanNode = new SpanNode( spanLabelNode, viewSpanWidth, {
      left: this.graphPanel.left,
      top: this.graphPanel.bottom + 2
    } );

    // make sure the horizontal label doesn't overlap with the spanNode
    if ( horizontalAxisLabelNode.left < spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN ) {
      horizontalAxisLabelNode.left = spanNode.right + HORIZONTAL_AXIS_LABEL_MARGIN;
    }

    this.addChild( spanNode );

    this.verticalRangeProperty.link( verticalRange => {
      const majorHorizontalSpacing = ( verticalRange.getLength() ) / ( options.numberHorizontalLines - 1 );
      const majorVerticalLineSpacing = this.horizontalRangeProperty.get().getLength() / ( options.numberVerticalLines - 1 );
      this.setLineSpacings( majorVerticalLineSpacing, majorHorizontalSpacing, null, null );
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
      this.plotWidth - this.rightGraphMargin,
      this.graphPanel.bounds,
      this.horizontalRangeProperty.max,
      this.timeProperty,
      this.modelViewTransformProperty
    );
    this.graphPanel.addChild( dynamicSeriesNode );
    this.scrollingChartNodeDisposeEmitter.addListener( () => dynamicSeriesNode.dispose() );
  }

  /**
   * @public - restore initial conditions
   */
  reset() {
    this.resetSeismographNode();

    // TODO: who is responsible for clearing the dynamicSeriesArray?  See https://github.com/phetsims/griddle/issues/48
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