// Copyright 2020-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import griddle from './griddle.js';

type StringsType = {
  'griddle': {
    'title': string;
    'titleStringProperty': TReadOnlyProperty<string>;
  }
};

const GriddleStrings = getStringModule( 'GRIDDLE' ) as StringsType;

griddle.register( 'GriddleStrings', GriddleStrings );

export default GriddleStrings;
