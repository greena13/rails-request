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
import endsWith from 'lodash.endsWith';

import arrayFrom from './utils/arrayFrom';

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

      return find(sourceArray, (sourceElement) => {
        return !identifiersDoNotMatch(correspondsTo, sourceElement, identifiers)
      }) || undefined;

    } else {
      return elementAtSameIndex;
    }
  }

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
