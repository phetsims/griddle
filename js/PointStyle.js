// Copyright 2019, University of Colorado Boulder

/**
 * A collection of styles that can be applied to a single point of a scatter styled XYPlot. Can control things like
 * point visibility, stroke, size, and opacity for an individual point.
 * 
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const griddle = require( 'GRIDDLE/griddle' );

  class PointStyle {

    /**
     * @param {object} [options]
     */
    constructor( options ) {

      options = _.extend( {

        // {number}
        opacity: 1,

        // {number|null} - radius of the data point, if null the radius will be determined by XYDataSeriesNode
        radius: null
      }, options );

      // @public - see options for documentation
      this.opacity = options.opacity;
      this.radius = options.radius;
    }
  }

  return griddle.register( 'PointStyle', PointStyle );
} );
