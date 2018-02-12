import some from 'lodash.some';
import has from 'lodash.has';
import find from 'lodash.find';
import without from 'lodash.without';

import reduce from 'lodash.reduce';
import each from 'lodash.foreach';
import map from 'lodash.map';

import isUndefined from 'lodash.isundefined';
import isPlainObject from 'lodash.isplainobject';
import size from 'lodash.size';

import camelCase from 'lodash.camelcase';
import snakeCase from 'lodash.snakecase';
import endsWith from 'lodash.endswith';

import arrayFrom from './utils/arrayFrom';

/**
 * Returns a new JavaScript object that represents the information stored in another,
 * but with the format and naming conventions consistent with a request to a Ruby on
 * Rails server
 *
 * The default behaviour will:
 * - Snake case attribute names
 * - Keys that contain nested object will have the '_attributes' suffix added
 * - Arrays of nested objects will be converted to hashes with index keys
 *
 * @param {object} target The object to convert to a Rails-friendly format
 * @param {object} options Configuration object to customise the returned object
 * @param {Array.<String>} [options.identifiers=['id']] A list of names of attributes
 *        that should be treated as identifiers. These values are present in the
 *        final object to allow Rails to locate the accompanying resources to be
 *        created, updated or associated. If unspecified, 'id' attributes will be
 *        treated as the only identifiers.
 * @param {String} [options.nestedAttributesSuffix='_attributes'] The suffix that
 *        should be added to nested objects. If unspecified, the Rails-friendly
 *        suffix '_attributes' is appended to the keys that store all nested objects.
 * @param {String} [options.attributeFormat='snakeCase'] The name of the string
 *        conversion algorithm that should be applied to attribute names. By default
 *        all attribute names are snake cased to be consistent with Rails' conventions.
 *        When 'camelCase', attribute names are camel cased.
 * @param {object} [options.diff] Another object the target object should be
 *        recursively compared to in order to generate a third object that describes
 *        the changes that need to be applied to that object to get the target one.
 * @param {String} [options.destroyAttributeName='_destroy'] The attribute name that
 *        should be used in destroy objects (resultant from an associated object being
 *        destroyed).
 * @param {*} [options.destroyAttributeValue=1] The value that should be used in
 *        destroy objects (resultant from an associated object being destroyed).
 * @param {boolean} [options.convertObjectArrays=true] Whether to convert nested
 *        arrays of objects to maps with index keys. If false, the arrays are not
 *        converted.
 * @returns {object} The object consistent with the format and naming conventions of
 *        a Rails request
 *
 * @example Generating a creation object for a new object using the default Rails
 *          conventions
 *
 * const jsObject = {
 *  userName: 'user123',
 *  address: {
 *    line1: '1 Street',
 *    line2: 'City, Country'
 *  },
 *  achievementIds: [3,5],
 *  photos: [
 *    { id: 23, url: 'http://url.com/123' },
 *    { id: 25, url: 'http://url.com/123' }
 *  ]
 *};
 *
 * const railsObject = railsRequest(jsObject);
 *
 * railsObject === {
 *   user_name: 'user123',
 *   address_attributes: {
 *     line1: '1 Street',
 *     line2: 'City, Country'
 *   },
 *   achievement_ids: [3,5],
 *   photos_attributes: {
 *     0: { id: 23, url: 'http://url.com/123' },
 *     1: { id: 25, url: 'http://url.com/123' }
 *   }
 * }
 *
 * @example Generating a creation object without the _attributes suffix for nested
 *          objects
 *
 * const railsObject = railsRequest(jsObject, { nestedAttributesSuffix: false });
 *
 * railsObject === {
 *   user_name: 'user123',
 *   address: {
 *     line1: '1 Street',
 *     line2: 'City, Country'
 *   },
 *   achievement_ids: [3,5],
 *   photos: {
 *     0: { id: 23, url: 'http://url.com/123' },
 *     1: { id: 25, url: 'http://url.com/123' }
 *   }
 * }
 *
 * @example Generating a creation object without snake casing attribute names
 *
 * const railsObject = railsRequest(jsObject, { attributeFormat: 'camelCase' });
 *
 *  railsObject === {
 *   userName: 'user123',
 *   addressAttributes: {
 *     line1: '1 Street',
 *     line2: 'City, Country'
 *   },
 *   achievementIds: [3,5],
 *   photosAttributes: {
 *     0: { id: 23, url: 'http://url.com/123' },
 *     1: { id: 25, url: 'http://url.com/123' }
 *   }
 * }
 */
function changes(target, options = {}) {

  const sanitizedOptions = sanitizeOptions(options);

  if (has(sanitizedOptions, 'diff')) {
    const originalChangeDescription = changeDescription(sanitizedOptions.diff, target, sanitizedOptions);

    if (originalChangeDescription.changed) {
      return railsFormat(originalChangeDescription.changes, sanitizedOptions);
    } else {
      return null;
    }
  } else {
    return railsFormat(target, sanitizedOptions);
  }
}

function railsFormat(target, options) {

  if (isPlainObject(target)) {

    return reduce(target, (memo, value, key) => {

      if (isPlainObject(value) || (Array.isArray(value) && some(value, isPlainObject)) ) {

        const attributeWithSuffix = function(){
          if (endsWith(key, options.nestedAttributesSuffix)) {
            return key;
          } else {
            return key + options.nestedAttributesSuffix;
          }
        }();

        memo[options.formatAttribute(attributeWithSuffix)] = railsFormat(value, options);
      } else {
        memo[options.formatAttribute(key)] = railsFormat(value, options);
      }

      return memo;
    }, {});

  } else if (Array.isArray(target)) {

    if (options.convertObjectArrays !== false && some(target, isPlainObject)) {

      return reduce(target, (memo, value, index) => {
        memo[index] = railsFormat(value, options);

        return memo;
      }, {});

    } else {

      return map(target, (value) => {
        return railsFormat(value, options);
      });

    }

  } else {
    return target;
  }

}


function sanitizeOptions(options) {

  const identifiers = function(){
    if (has(options, 'identifiers')) {
      return arrayFrom(options.identifiers);
    } else {
      return ['id'];
    }
  }();

  const identifiersLookup = reduce(identifiers, (memo, attributeName) => {
    memo[attributeName] = attributeName;

    return memo;
  }, {});

  const nestedAttributesSuffix = function(){

    if (has(options, 'nestedAttributesSuffix')) {
      let nestedAttributesSuffix = options.nestedAttributesSuffix;

      if (nestedAttributesSuffix === false) {
        return '';
      } else {
        return nestedAttributesSuffix;
      }
    } else {
      return '_attributes';
    }

  }();

  const formatter = function(){

    if (has(options, 'attributeFormat')) {
      if (options.attributeFormat === 'camelCase') {
        return camelCase;
      } else {
        throw new Error(
          `Unsupported attributeFormat '${options.attributeFormat}' passed to rails-request. Must be either 'camelCase' or 'snakeCase' (default).`
        );
      }
    } else {
      return snakeCase;
    }
  }();

  const destroyAttributeName = function(){
    if (has(options, 'destroyAttributeName')) {
      return options.destroyAttributeName;
    } else {
      return '_destroy';
    }
  }();

  const destroyAttributeValue = function(){
    if (has(options, 'destroyAttributeValue')) {
      return options.destroyAttributeValue;
    } else {
      return 1;
    }
  }();

  const formatAttribute = function(attributeName) {
    if (attributeName === destroyAttributeName) {
      return attributeName;
    } else {
      return formatter(attributeName);
    }
  };

  return {
    ...options,
    identifiers: identifiersLookup,
    nestedAttributesSuffix,
    formatAttribute,
    destroyAttributeName,
    destroyAttributeValue
  };
}

function changeDescription(original, changed, options) {

  if (isPlainObject(changed)) {

    return objectChangeDescription(original, changed, options );

  } else if (Array.isArray(changed)) {

    return arrayChangeDescription(original, changed, options );

  } else {

    if (changed === original) {
      return { changed: false };
    } else {
      return { changed: true, changes: changed };
    }

  }
}

function objectChangeDescription(original, changed, options) {

  if (isPlainObject(original)) {

    let objectContainsChanges = false;

    let objectChanges = reduce(options.identifiers, (memo, identifier) => {
      const identifierValue = changed[identifier];

      if (!isUndefined(identifierValue)) {
        memo[identifier] = identifierValue;
      }

      return memo;
    }, {});

    objectChanges = reduce(changed, (memo, value, name) => {

      if (!options.identifiers[name]) {

        const objectChange = changeDescription(original[name], value, options);

        if (objectChange.changed) {
          objectContainsChanges = true;

          memo[name] = objectChange.changes;
        }
      }

      return memo;

    }, objectChanges);

    if (objectContainsChanges) {
      return { changes: objectChanges, changed: true };
    } else {
      return { changed: false };
    }

  } else {

    return { changes: changed, changed: true };

  }

}


function arrayChangeDescription(original, changed, options) {

  if (Array.isArray(original)) {

    const arrayContainsNonObjects =
      some([ ...changed, ...original], (element) => !isPlainObject(element));

    if (arrayContainsNonObjects) {

      return shallowArrayChangeDescription(original, changed, options);

    } else {

      return deepArrayChangeDescription(original, changed, options);
    }

  } else {

    return { changes: changed, changed: true };

  }
}

function shallowArrayChangeDescription(original, changed, options) {

  if (size(changed) === size(original)) {

    const arraysAreNotEqual =
      some(changed, (element, index) => {
        const elementChangeDescription =
          changeDescription(original[index], element, options);

        return elementChangeDescription.changed;
      });

    if (arraysAreNotEqual) {

      return { changes: changed, changed: true };

    } else {

      return { changed: false };

    }

  } else {

    return { changes: changed, changed: true };

  }
}

function deepArrayChangeDescription(original, changed, options) {

  let arrayContainsChanges = false;
  let originalElementsWithoutComparison = [ ...original ];

  const arrayChanges = reduce(changed, (memo, element, index) => {

    const correspondingOriginalElement = correspondingElementFrom(original, {
      correspondsTo: element,
      firstInspectElementAt: index,
      identifiers: options.identifiers
    });

    const elementIsAdditionToArray = isUndefined(correspondingOriginalElement);

    if (elementIsAdditionToArray) {
      arrayContainsChanges = true;
      memo.push(element);

    } else {

      originalElementsWithoutComparison = without(
        originalElementsWithoutComparison,
        correspondingOriginalElement
      );

      const elementChangeDescription =
        changeDescription(correspondingOriginalElement, element, options);

      if (elementChangeDescription.changed) {
        arrayContainsChanges = true;

        memo.push(elementChangeDescription.changes);
      }

    }

    return memo;

  }, []);

  if (some(originalElementsWithoutComparison)) {
    arrayContainsChanges = true;

    addRemovalsTo(arrayChanges, {
      ...options,
      elementsToRemove: originalElementsWithoutComparison,
      identifiers: options.identifiers
    });
  }

  if (arrayContainsChanges) {
    return { changes: arrayChanges, changed: true };
  } else {
    return { changed: false };
  }

}

function addRemovalsTo(arrayChanges, { destroyAttributeName, destroyAttributeValue, elementsToRemove, identifiers, formatAttribute }) {

  each(elementsToRemove, (element) => {
    const elementRemoval = { };

    each(identifiers, (identifier) => {
      const identifierValue = element[identifier];

      if (!isUndefined(identifierValue)) {
        elementRemoval[formatAttribute(identifier)] = identifierValue;
      }
    });

    elementRemoval[destroyAttributeName] = destroyAttributeValue;

    arrayChanges[size(arrayChanges)] = elementRemoval;
  })
}


function correspondingElementFrom(sourceArray, { correspondsTo, identifiers, firstInspectElementAt }) {

  if (firstInspectElementAt < sourceArray.length) {

    const elementAtSameIndex = sourceArray[firstInspectElementAt];

    const hasDifferentIdentifierValues =
      identifiersDoNotMatch(correspondsTo, elementAtSameIndex, identifiers);

    if (hasDifferentIdentifierValues) {

      return searchEntireArray(sourceArray, correspondsTo, identifiers);

    } else {
      return elementAtSameIndex;
    }
  } else {

    return searchEntireArray(sourceArray, correspondsTo, identifiers);

  }

}

function searchEntireArray(sourceArray, correspondsTo, identifiers) {
  return find(sourceArray, (sourceElement) => {
    return !identifiersDoNotMatch(correspondsTo, sourceElement, identifiers)
  }) || undefined;
}


function identifiersDoNotMatch(source, target, identifiers) {

  if (target) {
    return some(identifiers, (identifier) => {
      const identifierValue = source[identifier];

      if (isUndefined(identifierValue) && isUndefined(target[identifier])) {
        return false;
      } else {
        return target[identifier] !== identifierValue;
      }
    });

  } else {
    return true;
  }

}


export default changes;
