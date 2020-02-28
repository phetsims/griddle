// Copyright 2018-2020, University of Colorado Boulder

/**
 * QUnit tests for ScrollingChartNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Text from '../../scenery/js/nodes/Text.js';
import DynamicSeries from './DynamicSeries.js';
import ScrollingChartNode from './ScrollingChartNode.js';

QUnit.module( 'ScrollingChartNode' );

QUnit.test( 'Test dispose', assert => {
  const timeProperty = new Property( 0 );
  const series1 = new DynamicSeries( { color: 'blue' } );
  const scrollingChartNode = new ScrollingChartNode(
    timeProperty,
    [ series1 ],
    new Text( 'vertical' ),
    new Text( 'horizontal' ),
    new Text( 'scale' ), {}
  );
  scrollingChartNode.dispose();
  assert.ok( true, 'dispose completed' );
} );