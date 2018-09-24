// Copyright 2017, University of Colorado Boulder

/**
 * QUnit tests for ScrollingChartNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const Emitter = require( 'AXON/Emitter' );
  const Property = require( 'AXON/Property' );
  const ScrollingChartNode = require( 'GRIDDLE/ScrollingChartNode' );

  QUnit.module( 'ScrollingChartNode' );

  QUnit.test( 'Test dispose', function( assert ) {
    var timeProperty = new Property( 0 );
    var series1 = {
      color: 'blue',
      data: [],
      emitter: new Emitter()
    };
    var scrollingChartNode = new ScrollingChartNode(
      timeProperty,
      [ series1 ]
    );
    scrollingChartNode.dispose();
    assert.ok( true, 'dispose completed' );
  } );
} );