// Copyright 2020, University of Colorado Boulder

/**
 * QUnit tests for GriddleUtil
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import GriddleUtils from './GriddleUtils.js';

QUnit.module( 'GriddleUtils' );

QUnit.test( 'getValuesInRangeWithAnchor', assert => {

  // For example, say we want to draw gridlines on a chart between xMin=50 and xMax=200 with a gridline at x=100 and
  // each other line 30 units away.  Then the answer would be: [70,100,130,160,190]
  const answer = GriddleUtils.getValuesInRangeWithAnchor( 50, 200, 30, 100 );
  assert.deepEqual( answer, [ 70, 100, 130, 160, 190 ] );

  const answer2 = GriddleUtils.getValuesInRangeWithAnchor( -100, 100, 10 );
  assert.deepEqual( answer2, [ -100, -90, -80, -70, -60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ] );
} );