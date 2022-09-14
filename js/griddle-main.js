// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main file for the Griddle library demo.
 *
 * @deprecated - please use bamboo
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import GriddleDemoScreenView from './demo/GriddleDemoScreenView.js';
import GriddleStrings from './GriddleStrings.js';

const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

simLauncher.launch( () => {
  assert && deprecationWarning( 'Please use bamboo' );
  new Sim( GriddleStrings.griddle.titleStringProperty, [
    new Screen(
      ( () => {
        return {};
      } ),
      ( () => new GriddleDemoScreenView() ),
      {
        name: new Property( 'Griddle Demo' ),
        backgroundColorProperty: new Property( '#e4fcf4' )
      }
    )
  ], simOptions ).start();
} );