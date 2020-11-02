// Copyright 2018-2020, University of Colorado Boulder

/**
 * QUnit tests for XYChartNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Text from '../../scenery/js/nodes/Text.js';
import DynamicSeries from './DynamicSeries.js';
import XYChartNode from './XYChartNode.js';

QUnit.module( 'XYChartNode' );

QUnit.test( 'Test dispose', assert => {
  const series1 = new DynamicSeries( { color: 'blue' } );
  const scrollingChartNode = new XYChartNode( {
      horizontalAxisLabelNode: new Text( 'horizontal' ),
      verticalAxisLabelNode: new Text( 'vertical' )
    }
  );
  scrollingChartNode.addDynamicSeries( series1 );
  scrollingChartNode.dispose();
  assert.ok( true, 'dispose completed' );
} );