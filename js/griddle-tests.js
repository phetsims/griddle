// Copyright 2018-2020, University of Colorado Boulder

/**
 * Unit tests for griddle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * @deprecated - please use bamboo
 */

import './GriddleUtilsTests.js';
import './XYChartNodeTests.js';
import qunitStart from '../../chipper/js/sim-tests/qunitStart.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';

assert && deprecationWarning( 'Please use bamboo' );

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();