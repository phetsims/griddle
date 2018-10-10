// Copyright 2017, University of Colorado Boulder

/**
 * QUnit tests for ScrollingChartNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const DynamicSeries = require( 'GRIDDLE/DynamicSeries' );
  const Property = require( 'AXON/Property' );
  const ScrollingChartNode = require( 'GRIDDLE/ScrollingChartNode' );

  QUnit.module( 'ScrollingChartNode' );

  QUnit.test( 'Test dispose', assert => {
    const timeProperty = new Property( 0 );
    const series1 = new DynamicSeries( { color: 'blue' } );
    const scrollingChartNode = new ScrollingChartNode(
      timeProperty,
      [ series1 ]
    );
    scrollingChartNode.dispose();
    assert.ok( true, 'dispose completed' );
  } );
} );