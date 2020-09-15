// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 */

import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import GriddleDemoScreenView from './demo/GriddleDemoScreenView.js';
import griddleStrings from './griddleStrings.js';

const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

simLauncher.launch( function() {
  new Sim( griddleStrings.griddle.title, [
    new Screen(
      function() { return {}; },
      function() { return new GriddleDemoScreenView(); },
      { name: 'Griddle Demo' }
    )
  ], simOptions ).start();
} );