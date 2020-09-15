// Copyright 2020, University of Colorado Boulder

/**
 * A reusable Node that draws a 2D grid. The grid can have "major" lines which are generally more visually prominent,
 * and "minor" lines which break the major lines into further subdivisions. Origin is at the top left of the grid,
 * and lines are drawn with desired spacing between the origin and grid width/height.
 *
 * Line spacings are in model coordinates. My providing an optional Property.<ModelViewTransform2> you can
 * manipulate the line spacings for scale/translation in view coordinates. Arbitrary rotation is not supported.
 *
 * @author Jesse Greenberg
 */

import Enumeration from '../../phet-core/js/Enumeration.js';
import merge from '../../phet-core/js/merge.js';
import Path from '../../scenery/js/nodes/Path.js';
import griddle from './griddle.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import Property from '../../axon/js/Property.js';
import Node from '../../scenery/js/nodes/Node.js';
import Shape from '../../kite/js/Shape.js';
import Utils from '../../dot/js/Utils.js';

// Contains the types of lines that can be drawn on this grid
const LineType = Enumeration.byKeys( [ 'MINOR_VERTICAL', 'MAJOR_VERTICAL', 'MINOR_HORIZONTAL', 'MAJOR_HORIZONTAL' ] );

class GridNode extends Node {

  /**
   * @param {number} gridWidth - width of the grid in view coordinates
   * @param {number} gridHeight - height of the grid in view coordinates
   * @param {Object} [options]
   */
  constructor( gridWidth, gridHeight, options ) {
    options = merge( {

      // {number|null} spacing between major horizontal lines, in model coordinates - no major horizontal lines if null
      majorHorizontalLineSpacing: null,

      // {number|null} spacing between major vertical lines, in model coordinates - no major vertical lines if null
      majorVerticalLineSpacing: null,

      // {number|null} spacing between minor horizontal lines, in model coordinates - no minor horizontal lines if null
      minorHorizontalLineSpacing: null,

      // {number|null} spacing between minor vertical lines, in model coordinates - no minor vertical lines if null
      minorVerticalLineSpacing: null,

      // {null|Property.<ModelViewTransform2>} - model-view transform for the grid for line spacings and other
      // transformations
      modelViewTransformProperty: null,

      // {null|number} - Precision for the placement of grid lines, in model coordinates. null value
      // will not use any precision. GridNode will calculate line positions based on spacings and the model view
      // transform. But this is susceptible to IEEE precision errors, ocassionally resulting in missed lines.
      gridLinePrecision: null,

      // {Object} - passed to the Path for minor lines
      minorLineOptions: {
        stroke: 'grey',
        lineWidth: 1
      },

      // {Object} - passed to the Path for major lines
      majorLineOptions: {
        stroke: 'black',
        lineWidth: 3
      }
    }, options );

    const ownsModelViewTransformProperty = !options.modelViewTransformProperty;

    super();

    // @private {number}
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // @private {null|number}
    this.minorHorizontalLineSpacing = null;
    this.minorVerticalLineSpacing = null;
    this.majorVerticalLineSpacing = null;
    this.majorHorizontalLineSpacing = null;
    this.gridLinePrecision = options.gridLinePrecision;

    // @private {Property.<ModelViewTransform2>} - model-view transform for the grid
    this.modelViewTransformProperty = options.modelViewTransformProperty || new Property( ModelViewTransform2.createIdentity() );

    // @private - Paths for each of the sets of lines.  They cannot be combined because they may each have different dash
    // patterns or other options
    this.minorHorizontalLines = new Path( null, options.minorLineOptions );
    this.minorVerticalLines = new Path( null, options.minorLineOptions );
    this.majorHorizontalLines = new Path( null, options.majorLineOptions );
    this.majorVerticalLines = new Path( null, options.majorLineOptions );

    assert && assert( !options.children, 'GridNode sets children' );
    this.children = [ this.minorHorizontalLines, this.minorVerticalLines, this.majorHorizontalLines, this.majorVerticalLines ];

    // redraw lines when the transform changes
    const transformListener = this.drawAllLines.bind( this );
    this.modelViewTransformProperty.lazyLink( transformListener );

    // set spacings and draw the grid
    this.setLineSpacings( {
      majorVerticalLineSpacing: options.majorVerticalLineSpacing,
      majorHorizontalLineSpacing: options.majorHorizontalLineSpacing,
      minorVerticalLineSpacing: options.minorVerticalLineSpacing,
      minorHorizontalLineSpacing: options.minorHorizontalLineSpacing
    } );

    // mutate with Node options after grid is drawn so that bounds are defined
    this.mutate( options );

    // @private
    this.disposeGridNode = () => {
      this.modelViewTransformProperty.unlink( transformListener );
      ownsModelViewTransformProperty && this.modelViewTransformProperty.dispose();
    };
  }

  /**
   * Sets the precisin for calculating locations of the grid lines, in model coordinates.
   * null value will calculate positions with IEEE floating point values. This usually works
   * but sometimes results in floating point errors that mean some grid lines are lost. Set
   * precision to keep grid lines exact.
   * @public
   *
   * @param {null|number} precision
   */
  setGridLinePrecision( precision ) {
    this.gridLinePrecision = precision;
    this.drawAllLines();
  }

  /**
   * Set the line spacings for all major and minor lines.
   * @public
   *
   * @param {Object} config
   */
  setLineSpacings( config ) {

    config = merge( {

      // {number|null} - at least one of these is required, major spacings must be a multiple
      // of minor spacings
      majorVerticalLineSpacing: null,
      minorVerticalLineSpacing: null,
      majorHorizontalLineSpacing: null,
      minorHorizontalLineSpacing: null
    }, config );

    assert && assert( !_.every( config, spacing => spacing === null ), 'at least one spacing must be used' );
    this.validateMajorMinorPair( config.majorVerticalLineSpacing, config.minorVerticalLineSpacing );
    this.validateMajorMinorPair( config.majorHorizontalLineSpacing, config.minorHorizontalLineSpacing );

    if ( this.majorVerticalLineSpacing !== config.majorVerticalLineSpacing || this.majorHorizontalLineSpacing !== config.majorHorizontalLineSpacing ) {
      this.majorVerticalLineSpacing = config.majorVerticalLineSpacing;
      this.majorHorizontalLineSpacing = config.majorHorizontalLineSpacing;

      this.drawMajorLines();
    }

    if ( this.minorVerticalLineSpacing !== config.minorVerticalLineSpacing || this.minorHorizontalLineSpacing !== config.minorHorizontalLineSpacing ) {
      this.minorVerticalLineSpacing = config.minorVerticalLineSpacing;
      this.minorHorizontalLineSpacing = config.minorHorizontalLineSpacing;

      this.drawMinorLines();
    }
  }

  /**
   * Validate each parameter, and make sure that as a pair they are as expected.
   * @private
   *
   * @param {number|null} majorSpacing
   * @param {number|null} minorSpacing
   */
  validateMajorMinorPair( majorSpacing, minorSpacing ) {
    assert && assert( ( typeof majorSpacing === 'number' && majorSpacing > 0 ) ||
                      majorSpacing === null, 'majorSpacing should be positive number or null' );
    assert && assert( ( typeof minorSpacing === 'number' && minorSpacing > 0 ) ||
                      minorSpacing === null, 'minorSpacing should be positive number or null' );

    if ( majorSpacing !== null && minorSpacing !== null ) {
      assert && assert( majorSpacing > minorSpacing, 'major spacing must be greater than minor spacing' );

      // allow for precision errors, see phetsims/scenery-phet#601
      assert && assert( Utils.equalsEpsilon( majorSpacing % minorSpacing, 0, 1E-10 ) ||
                        Utils.equalsEpsilon( majorSpacing % minorSpacing - minorSpacing, 0, 1E-10 ), 'minor spacing must be a multiple of major spacing' );
    }
  }

  /**
   * Set the width of the grid, relative to the origin (left top).
   * @public
   *
   * @param {number} width
   */
  setGridWidth( width ) {
    this.gridWidth = width;
    this.drawAllLines();
  }

  /**
   * Set the height of the grid relative to the origin (left top).
   * @public
   *
   * @param {number} height
   */
  setGridHeight( height ) {
    this.gridHeight = height;
    this.drawAllLines();
  }

  /**
   * Redraw the minor lines.
   * @private
   */
  drawMinorLines() {
    this.drawVerticalLines( this.minorVerticalLineSpacing, LineType.MINOR_VERTICAL, this.minorVerticalLines );
    this.drawHorizontalLines( this.minorHorizontalLineSpacing, LineType.MINOR_HORIZONTAL, this.minorHorizontalLines );
  }

  /**
   * Redraw the major lines.
   * @private
   */
  drawMajorLines() {
    this.drawVerticalLines( this.majorVerticalLineSpacing, LineType.MAJOR_VERTICAL, this.majorVerticalLines );
    this.drawHorizontalLines( this.majorHorizontalLineSpacing, LineType.MAJOR_HORIZONTAL, this.majorHorizontalLines );
  }

  /**
   * Draw vertical lines with the provided spacing. A shape is drawn and set to the provided Path.
   * @private
   *
   * @param {number} lineSpacing
   * @param {LineType} lineType
   * @param {Path} linesPath
   */
  drawVerticalLines( lineSpacing, lineType, linesPath ) {
    const shape = new Shape();
    const modelViewTransform = this.modelViewTransformProperty.get();

    const xPositions = this.getLinePositionsInGrid( lineSpacing, lineType );
    xPositions.forEach( xPosition => {
      const viewPosition = modelViewTransform.modelToViewX( xPosition );
      shape.moveTo( viewPosition, 0 );
      shape.lineTo( viewPosition, this.gridHeight );
    } );

    // in case the Path has a line dash, they should appear to move with the grid
    linesPath.lineDashOffset = -modelViewTransform.modelToViewY( 0 );
    linesPath.shape = shape;
  }

  /**
   * Draws horizontal lines with the provided spacing. A shape is drawn and set to the provided Path.
   * @private
   *
   * @param {number} lineSpacing
   * @param {LineType} lineType
   * @param {Path} linesPath
   */
  drawHorizontalLines( lineSpacing, lineType, linesPath ) {
    const shape = new Shape();
    const modelViewTransform = this.modelViewTransformProperty.get();

    const yPosition = this.getLinePositionsInGrid( lineSpacing, lineType );
    yPosition.forEach( yPosition => {
      const viewPosition = modelViewTransform.modelToViewY( yPosition );
      shape.moveTo( 0, viewPosition );
      shape.lineTo( this.gridWidth, viewPosition );
    } );

    // in case the Path has a line dash, they should appear to move with the grid
    linesPath.lineDashOffset = -modelViewTransform.modelToViewX( 0 );
    linesPath.shape = shape;
  }

  /**
   * Redraw all grid lines.
   * @private
   */
  drawAllLines() {
    this.drawMajorLines();
    this.drawMinorLines();
  }

  /**
   * Returns an array of positions of grid lines in model coordinates, within the view bounds of the grid. Useful
   * for decorating the grid with labels or other things.
   * @public
   *
   * @param {number|null} spacing
   * @param {LineType} lineType
   * @returns {number[]}
   */
  getLinePositionsInGrid( spacing, lineType ) {
    assert && assert( LineType.includes( lineType ), 'provided lineType should be one of LineType' );
    assert && assert( spacing === null || typeof spacing === 'number', `spacing not defined for ${lineType}` );

    const positions = [];

    // no lines of this line type in grid, return empty array
    if ( spacing === null ) {
      return positions;
    }

    const modelViewTransform = this.modelViewTransformProperty.get();

    let modelMin;
    let modelSpan;
    let modelMax;

    if ( lineType === LineType.MAJOR_VERTICAL || lineType === LineType.MINOR_VERTICAL ) {
      modelMin = modelViewTransform.viewToModelX( 0 );
      modelSpan = Math.abs( modelViewTransform.viewToModelDeltaX( this.gridWidth ) );
      modelMax = modelViewTransform.viewToModelX( this.gridWidth );
    }
    else if ( lineType === LineType.MAJOR_HORIZONTAL || lineType === LineType.MINOR_HORIZONTAL ) {
      modelMin = modelViewTransform.viewToModelY( 0 );
      modelSpan = Math.abs( modelViewTransform.viewToModelDeltaY( this.gridHeight ) );
      modelMax = modelViewTransform.viewToModelY( this.gridHeight );
    }

    // distance from top edge of the gridNode to the first horizontal line, rounded to account for precision
    // errors with IEEE floating point values
    const remainderToGridLine = Utils.toFixedNumber( modelMin % spacing, 10 );
    const distanceToGridLine = ( spacing - remainderToGridLine ) % spacing;

    // the model-view transform may have flipped relative bottom and top with an inverse vertical transformation,
    // make sure we start the array with lower values
    let minPosition = Math.min( modelMin, modelMax ) + distanceToGridLine;
    let maxPosition = Math.min( modelMin, modelMax ) + modelSpan;

    if ( this.gridLinePrecision !== null ) {
      minPosition = Utils.toFixedNumber( minPosition, this.gridLinePrecision );
      maxPosition = Utils.toFixedNumber( maxPosition, this.gridLinePrecision );
    }

    for ( let y = minPosition; y <= maxPosition; y += spacing ) {
      positions.push( y );
    }

    return positions;
  }

  /**
   * @public
   */
  dispose() {
    this.disposeGridNode();
  }
}

// @public
// @static
GridNode.LineType = LineType;

griddle.register( 'GridNode', GridNode );

export default GridNode;
