// Copyright 2018-2021, University of Colorado Boulder

/**
 * QUnit tests for XYChartNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * @deprecated - please use bamboo
 */

import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import { Text } from '../../scenery/js/imports.js';
import DynamicSeries from './DynamicSeries.js';
import XYChartNode from './XYChartNode.js';

QUnit.module( 'XYChartNode' );

QUnit.test( 'Test dispose', assert => {
  assert && deprecationWarning( 'Please use bamboo' );
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