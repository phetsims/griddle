// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 */

import Property from '../../axon/js/Property.js';
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
      {
        name: 'Griddle Demo',
        backgroundColorProperty: new Property( '#e4fcf4' )
      }
    )
  ], simOptions ).start();
} );