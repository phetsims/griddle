// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 */

import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import GriddleDemoScreenView from './demo/GriddleDemoScreenView.js';
import griddleStrings from './griddle-strings.js';

const griddleTitleString = griddleStrings.griddle.title;

const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

SimLauncher.launch( function() {
  // Create and start the sim
  new Sim( griddleTitleString, [
    new Screen( function() {return {};}, function() {return new GriddleDemoScreenView();}, {
      name: 'Griddle Demo'
    } )
  ], simOptions ).start();
} );