// Copyright 2019-2022, University of Colorado Boulder

/**
 * A collection of styles that can be applied to a single point of a scatter styled plot. Can control things like
 * point visibility, stroke, size, and opacity for an individual point.
 *
 * @author Jesse Greenberg
 */

import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import merge from '../../phet-core/js/merge.js';
import griddle from './griddle.js';

/**
 * @deprecated - please use BAMBOO/GridLineSet
 */
class PointStyle {

  /**
   * @param {object} [options]
   */
  constructor( options ) {
    assert && deprecationWarning( 'Please use bamboo' );

    options = merge( {

      // {number|null}
      opacity: null,

      // {boolean} - if false, this point won't be drawn
      visible: true,

      // {Color|null} - if specified, the data point will be stroked with this Color, which must be a Color instance
      // so we can determine the CSS strokeStyle
      strokeStyle: null,

      // {number} - lineWidth for the stroke, only relevant if strokeStyle is provided
      lineWidth: 1,

      // {number|null} - radius of the data point, if null the radius will be determined by the container
      radius: null
    }, options );

    // @public - see options for documentation
    this.opacity = options.opacity;
    this.radius = options.radius;
    this.visible = options.visible;
    this.lineWidth = options.lineWidth;
    this.strokeStyle = options.strokeStyle;
  }
}

griddle.register( 'PointStyle', PointStyle );
export default PointStyle;