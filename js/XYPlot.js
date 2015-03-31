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
  var XYDataSeriesNode = require( 'GRIDDLE/XYDataSeriesNode' );

  function XYPlot( options ) {
    var content = new Node();

    this.options = _.extend( {
      width: 400,
      height: 400,
      numVerticalGridLines: 10,
      numHorizontalGridLines: 10,
      backgroundFill: 'white',
      minX: 0,
      maxX: 10,
      minY: 0,
      maxY: 10
    }, options );

    //tailX, tailY, tipX, tipY, options
    var panelOptions = {
      fill: this.options.backgroundFill,
      xMargin: 10,
      yMargin: 10
    };

    var lineWidth;
    var line;
    //vertical grid lines
    for ( var i = 0; i < this.options.numVerticalGridLines + 1; i++ ) {
      lineWidth = i % 2 === 0 ? 0.8 : 0.3;
      line = new Line( i * this.options.width / 10, 0, i * this.options.width / 10, -this.options.height, {
        stroke: 'gray',
        lineWidth: lineWidth
      } );
      content.addChild( line );
      if ( i % 2 === 0 ) {
        content.addChild( new Text( i, { font: new PhetFont( 16 ), centerX: line.centerX, top: line.bottom + 6 } ) );
      }
    }

    //horizontal grid lines
    for ( i = 0; i < this.options.numHorizontalGridLines + 1; i++ ) {
      lineWidth = i % 2 === 0 ? 0.8 : 0.3;
      line = new Line( 0, -i * this.options.height / 10, this.options.width, -i * this.options.height / 10, {
        stroke: 'gray',
        lineWidth: lineWidth
      } );
      content.addChild( line );
      if ( i % 2 === 0 ) {
        content.addChild( new Text( i, { font: new PhetFont( 16 ), centerY: line.centerY, right: line.left - 6 } ) );
      }
    }

    content.addChild( new ArrowNode( 0, 0, 0, -this.options.height, {} ) );
    content.addChild( new ArrowNode( 0, 0, this.options.width, 0, {} ) );

    Panel.call( this, content, panelOptions );

    /**
     * Map XYDataSeries -> XYDataSeriesNode
     * @public
     * @type {{}}
     */
    this.seriesViewMap = {};
    this.content = content;
  }

  return inherit( Panel, XYPlot, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    },
    appendPoint: function( x, y, color, stroke ) {

    },

    /**
     *
     * @param {XYDataSeries} series
     */
    addSeries: function( series ) {
      this.seriesViewMap[ series ] = new XYDataSeriesNode( series );
      this.content.addChild( this.seriesViewMap[ series ] );
    },

    /**
     *
     * @param {XYDataSeries} series
     */
    removeSeries: function( series ) {
      var view = this.seriesViewMap[ series ];
      this.content.removeChild( view );
      view.dispose();
      delete this.seriesViewMap[ series ];
    }
  } );
} );