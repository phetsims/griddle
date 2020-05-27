// Copyright 2020, University of Colorado Boulder

/**
 * A reusable Node that draws a 2D grid. The grid can have "major" lines which are generally more visually prominent,
 * and "minor" lines which break the major lines into further subdivisions. Origin is at the top left of the grid,
 * and lines are drawn with desired spacing between the origin and grid width/height.
 *
 * @author Jesse Greenberg
 */

import merge from '../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../phetcommon/js/view/ModelViewTransform2.js';
import Path from '../../scenery/js/nodes/Path.js';
import griddle from './griddle.js';
import Node from '../../scenery/js/nodes/Node.js';
import Shape from '../../kite/js/Shape.js';

class GridNode extends Node {

  /**
   * @param {number} gridWidth - in model coordinates
   * @param {number} gridHeight - in model coordinates
   * @param {Object} [options]
   */
  constructor( gridWidth, gridHeight, options ) {
    options = merge( {

      // {number|null} spacing between major horizontal lines in model coordinates - no major horizontal lines if null
      majorHorizontalLineSpacing: null,

      // {number|null} spacing between major vertical lines in model coordinates - no major vertical lines if null
      majorVerticalLineSpacing: null,

      // {number|null} spacing between minor horizontal lines in model coordinates - no minor horizontal lines added if
      // null
      minorHorizontalLineSpacing: null,

      // {number|null} spacing between minor vertical lines in model coordinates - no minor vertical lines if null
      minorVerticalLineSpacing: null,

      // {number} - Offsets for lines relative to the top left of the grid, in model coordinates. Lines are still drawn
      // at intervals of line spacings across bounds grid bounds, so this won't create empty space within the grid.
      verticalLineOffset: 0,
      horizontalLineOffset: 0,

      // {ModelViewTransform2} if provided, transforms grid dimensions, spacings, and offsets from the model
      // coordinate frame to the view coordinate frame for drawing
      modelViewTransform: ModelViewTransform2.createIdentity(),

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

    super();

    // @private {number}
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // @private {null|number}
    this.minorHorizontalLineSpacing = null;
    this.minorVerticalLineSpacing = null;
    this.majorVerticalLineSpacing = null;
    this.majorHorizontalLineSpacing = null;

    // @private {ModelViewTransform2}
    this.modelViewTransform = options.modelViewTransform;

    // @private {number}
    this._verticalLineOffset = options.verticalLineOffset;
    this._horizontalLineOffset = options.horizontalLineOffset;

    // @private {Path} - Path for minor lines
    this.minorLines = new Path( null, options.minorLineOptions );

    // @private {Path} - path for major lines
    this.majorLines = new Path( null, options.majorLineOptions );

    assert && assert( !options.children, 'GridNode sets children' );
    this.children = [ this.minorLines, this.majorLines ];

    // set spacings and draw the grid
    this.setLineSpacings( options.majorVerticalLineSpacing, options.majorHorizontalLineSpacing, options.minorVerticalLineSpacing, options.minorHorizontalLineSpacing );

    // mutate with Node options after grid is drawn so that bounds are defined
    this.mutate( options );
  }

  /**
   * Set the spacing for all major and minor lines.
   * @public
   *
   * @param {number|null} majorVerticalLineSpacing
   * @param {number|null} majorHorizontalLineSpacing
   * @param {number|null} minorVerticalLineSpacing
   * @param {number|null} minorHorizontalLineSpacing
   */
  setLineSpacings( majorVerticalLineSpacing, majorHorizontalLineSpacing, minorVerticalLineSpacing, minorHorizontalLineSpacing ) {
    this.validateMajorMinorPair( majorVerticalLineSpacing, minorVerticalLineSpacing );
    this.validateMajorMinorPair( majorHorizontalLineSpacing, minorHorizontalLineSpacing );

    if ( this.majorVerticalLineSpacing !== majorVerticalLineSpacing || this.majorHorizontalLineSpacing !== majorHorizontalLineSpacing ) {
      this.majorVerticalLineSpacing = majorVerticalLineSpacing;
      this.majorHorizontalLineSpacing = majorHorizontalLineSpacing;

      this.drawMajorLines();
    }

    if ( this.minorVerticalLineSpacing !== minorVerticalLineSpacing || this.minorHorizontalLineSpacing !== minorHorizontalLineSpacing ) {
      this.minorVerticalLineSpacing = minorVerticalLineSpacing;
      this.minorHorizontalLineSpacing = minorHorizontalLineSpacing;

      this.drawMinorLines();
    }
  }

  /**
   * Set the offset for vertical lines (major and minor), relative to the left of the grid node. Lines will be
   * drawn at spacing intervals from left to right edge of the grid, so this cannot be used to create empty space
   * within grid bounds if offset is larger than spacings.
   * @public
   *
   * @param {number} offset
   */
  setVerticalLineOffset( offset ) {
    if ( this._verticalLineOffset !== offset ) {
      this._verticalLineOffset = offset;
      this.drawAllLines();
    }
  }

  set verticalLineOffset( offset ) { this.setVerticalLineOffset( offset ); }

  /**
   * Get the offset for vertical lines.
   * @public
   *
   * @returns {number}
   */
  getVerticalLineOffset() {
    return this._verticalLineOffset;
  }

  get verticalLineOffset() { return this.getVerticalLineOffset(); }

  /**
   * Set the offset for horizontal lines (major and minor) relative to the top of the GridNode. Lines will be
   * drawn at spacing intervals from top to bottom edge of the grid, so this cannot be used to create empty space
   * within grid bounds if offset is larger than spacings.
   * @public
   *
   * @param {number} offset
   */
  setHorizontalLineOffset( offset ) {
    if ( this._horizontalLineOffset !== offset ) {
      this._horizontalLineOffset = offset;
      this.drawAllLines();
    }
  }

  set horizontalLineOffset( offset ) { this.setHorizontalLineOffset( offset ); }

  /**
   * Get the offset for horizontal lines.
   * @public
   *
   * @returns {number}
   */
  getHorizontalLineOffset() {
    return this._horizontalLineOffset;
  }

  get horizontalLineOffset() { return this.getHorizontalLineOffset(); }

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
      assert && assert( majorSpacing % minorSpacing === 0, 'minor spacing should be a multiple of major spacing' );
    }
  }

  /**
   * Set the width of the grid, relative to the origin (left top).
   * @public
   *
   * @param width
   */
  setGridWidth( width ) {
    this.gridWidth = width;
    this.drawAllLines();
  }

  /**
   * Set the height of the grid relative to the origin (left top).
   * @public
   *
   * @param height
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
    this.drawLines( this.minorHorizontalLineSpacing, this.minorVerticalLineSpacing, this.minorLines );
  }

  /**
   * Redraw the major lines.
   * @private
   */
  drawMajorLines() {
    this.drawLines( this.majorHorizontalLineSpacing, this.majorVerticalLineSpacing, this.majorLines );
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
   * Redraw lines and set the resultant shape to the Path.
   * @private
   *
   * @param {number|null} horizontalSpacing - horizontal lines not drawn if null
   * @param {number|null} verticalSpacing - vertical lines not drawn if null
   * @param {Path} linesPath - line shape is drawn with this Path
   */
  drawLines( horizontalSpacing, verticalSpacing, linesPath ) {
    const shape = new Shape();

    if ( verticalSpacing ) {
      const viewHeight = this.modelViewTransform.modelToViewDeltaY( this.gridHeight );

      const verticalLineOffset = this._verticalLineOffset % ( this.gridWidth * 2 );

      for ( let x = 0; x <= this.gridWidth * 2; x += verticalSpacing ) {
        const xPosition = x + verticalLineOffset % verticalSpacing;
        if ( xPosition >= 0 && xPosition <= this.gridWidth ) {
          const xViewPosition = this.modelViewTransform.modelToViewX( xPosition );
          shape.moveTo( xViewPosition, 0 );
          shape.lineTo( xViewPosition, viewHeight );
        }
      }
    }

    if ( horizontalSpacing ) {
      const viewWidth = this.modelViewTransform.modelToViewDeltaX( this.gridWidth );

      const horizontalLineOffset = this._horizontalLineOffset % ( this.gridHeight * 2 );

      for ( let y = 0; y <= this.gridHeight * 2; y += horizontalSpacing ) {
        const yPosition = y + horizontalLineOffset % horizontalSpacing;
        if ( yPosition >= 0 && yPosition <= this.gridHeight ) {
          const yViewPosition = this.modelViewTransform.modelToViewY( yPosition );
          shape.moveTo( 0, yViewPosition );
          shape.lineTo( viewWidth, yViewPosition );
        }
      }
    }

    linesPath.shape = shape;
  }
}

griddle.register( 'GridNode', GridNode );

export default GridNode;
