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
  const Text = require( 'SCENERY/nodes/Text' );
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
      new Text( 'Height (m)', { rotation: 3 * Math.PI / 2, fill: 'white' } ),
      new Text( '1 s', { fill: 'white' } ),
      timeProperty,
      200,
      150,
      [ series1 ],
      'time (s)'
    );
    scrollingChartNode.dispose();

    // You can uncomment this and run a memory test to check for dispose leaks.
    // setInterval( () => {
    //   var scrollingChartNode = new ScrollingChartNode(
    //     new Text( 'Height (m)', { rotation: 3 * Math.PI / 2, fill: 'white' } ),
    //     new Text( '1 s', { fill: 'white' } ),
    //     timeProperty,
    //     200,
    //     150,
    //     [ series1 ],
    //     'time (s)'
    //   );
    //   scrollingChartNode.dispose();
    // }, 16 );
    assert.ok( true, 'dispose completed' );
  } );
} );