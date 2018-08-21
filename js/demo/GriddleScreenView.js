// Copyright 2014-2017, University of Colorado Boulder

/**
 * Demonstration of griddle components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Checkbox = require( 'SUN/Checkbox' );
  var DemosScreenView = require( 'SUN/demo/DemosScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var sceneryPhetQueryParameters = require( 'SCENERY_PHET/sceneryPhetQueryParameters' );

  /**
   * @constructor
   */
  function GriddleScreenView() {
    DemosScreenView.call( this, [

      /**
       * To add a demo, add an object literal here. Each object has these properties:
       *
       * {string} label - label in the combo box
       * {function(Bounds2): Node} getNode - creates the scene graph for the demo
       */
      { label: 'ArrowNode', getNode: demoArrowNode }
    ], {
      comboBoxItemFont: new PhetFont( 12 ),
      comboBoxItemYMargin: 3,
      selectedDemoLabel: sceneryPhetQueryParameters.component
    } );
  }

  sceneryPhet.register( 'GriddleScreenView', GriddleScreenView );

  // Creates a demo for ArrowNode
  var demoArrowNode = function( layoutBounds ) {

    var arrowNode = new ArrowNode( 0, 0, 200, 200, {
      headWidth: 30,
      headHeight: 30,
      center: layoutBounds.center
    } );

    var checkedProperty = new Property( false );
    checkedProperty.link( function( checked ) {
      arrowNode.setDoubleHead( checked );
    } );

    var checkbox = Checkbox.createTextCheckbox( 'Double head', { font: new PhetFont( 20 ) }, checkedProperty, {
      centerX: layoutBounds.centerX,
      top: arrowNode.bottom + 50
    } );
    return new Node( {
      children: [
        checkbox,
        arrowNode
      ]
    } );
  };

  return inherit( DemosScreenView, GriddleScreenView );
} );