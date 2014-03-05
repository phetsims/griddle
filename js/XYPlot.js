// Copyright 2002-2014, University of Colorado Boulder

/**
 * XY Plot
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Panel = require( 'SUN/Panel' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  function XYPlot( options ) {
    var content = new Node();

    this.options = _.extend( {
      width: 400,
      height: 400,
      numVerticalGridLines: 10,
      numHorizontalGridLines: 10,
      backgroundFill: 'white'}, options );

    //tailX, tailY, tipX, tipY, options
    content.addChild( new ArrowNode( 0, 0, 0, -this.options.height, {} ) );
    content.addChild( new ArrowNode( 0, 0, this.options.width, 0, {} ) );
    var panelOptions = {fill: this.options.backgroundFill};

    //vertical grid lines
    for ( var i = 0; i < this.options.numVerticalGridLines; i++ ) {
      var lineWidth = i % 2 === 0 ? 0.8 : 0.3;
      content.addChild( new Line( i * this.options.width / 10, 0, i * this.options.width / 10, -this.options.height, {stroke: 'gray', lineWidth: lineWidth} ) );
    }

    //horizontal grid lines
    for ( i = 0; i < this.options.numHorizontalGridLines; i++ ) {
      var lineWidth = i % 2 === 0 ? 0.8 : 0.3;
      content.addChild( new Line( 0, -i * this.options.height / 10, this.options.width, -i * this.options.height / 10, {stroke: 'gray', lineWidth: lineWidth} ) );
    }

    Panel.call( this, content, panelOptions );
  }

  return inherit( Panel, XYPlot, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    }
  } );
} );