// Type definitions for Rails Request
// Project: rails-request

/**
 * Returns a new JavaScript object that represents the information stored in another,
 * but with the format and naming conventions consistent with a request to a Ruby on
 * Rails server
 *
 * The default behaviour will:
 * - Snake case attribute names
 * - Keys that contain nested object will have the '_attributes' suffix added
 * - Arrays of nested objects will be converted to hashes with index keys
 */
export default function(target: Object, options: {
    /**
     * A list of names of attributes
     *        that should be treated as identifiers. These values are present in the
     *        final object to allow Rails to locate the accompanying resources to be
     *        created, updated or associated. If unspecified, 'id' attributes will be
     *        treated as the only identifiers.
     */
    identifiers?: String[],

    /**
     * The suffix that should be added to nested objects. If unspecified, the
     * Rails-friendly suffix '_attributes' is appended to the keys that store all
     * nested objects.
     */
    nestedAttributesSuffix?: String,

    /**
     * The name of the string conversion algorithm that should be applied to attribute
     * names. By default all attribute names are snake cased to be consistent with
     * Rails' conventions. When 'camelCase', attribute names are camel cased.
     */
    attributeFormat?: String,

    /**
     * Another object the target object should be recursively compared to in order
     * to generate a third object that describes the changes that need to be applied
     * to that object to get the target one.
     */
    diff?: any,

    /**
     * The attribute name that should be used in destroy objects (resultant from an
     * associated object being destroyed).
     */
    destroyAttributeName?: String,

    /**
     * The value that should be used in destroy objects (resultant from an associated
     * object being destroyed).
     */
    destroyAttributeValue?: any,

    /**
     * Whether to convert nested arrays of objects to maps with index keys. If false,
     * the arrays are not converted.
     */
    convertObjectArrays?: boolean,
} = {
    identifiers: ['id'],
    nestedAttributesSuffix: '_attributes',
    attributeFormat: 'snakeCase',
    destroyAttributeName: '_destroy',
    destroyAttributeValue: 1,
    convertObjectArrays: true
}): object;
