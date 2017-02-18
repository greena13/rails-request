import each from 'lodash.foreach';

import railsRequest from '../../index';

describe('converting', function () {
  describe('using the default options', function(){
    describe('simple values', function() {

      it('then returns the value', function(){

        each([ undefined, null, 'string', 1, 0, 1.23 ], (value) => {
          expect(railsRequest(value)).toEqual(value);
        })

      });
    });

    describe('complex values', function(){

      it('then returns the value in a rails-compatible format', function(){
        const original = {
          a: 'a',
          b: 1,
          c: null,
          d: undefined,
          e: {
            f: ['g', 'h', 'i'],
            j: [
              { k: 'k', l: 'l' }, { k: 'm', l: 'n' }, { k: 'o' }
            ]
          }
        };

        const converted = {
          a: 'a',
          b: 1,
          c: null,
          d: undefined,
          e_attributes: {
            f: ['g', 'h', 'i'],
            j_attributes: {
              0: { k: 'k', l: 'l' },
              1: { k: 'm', l: 'n' },
              2: { k: 'o' }
            }
          }
        };

        expect(railsRequest(original)).toEqual(converted);
      });

    });
  });

  describe('when nestedAttributesSuffix is false', function(){
    it('then returns the value without nested attributes suffix', function(){
      const original = {
        a: 'a',
        b: 1,
        c: null,
        d: undefined,
        e: {
          f: ['g', 'h', 'i'],
          j: [
            { k: 'k', l: 'l' }, { k: 'm', l: 'n' }, { k: 'o' }
          ]
        }
      };

      const converted = {
        a: 'a',
        b: 1,
        c: null,
        d: undefined,
        e: {
          f: ['g', 'h', 'i'],
          j: {
            0: { k: 'k', l: 'l' },
            1: { k: 'm', l: 'n' },
            2: { k: 'o' }
          }
        }
      };

      expect(railsRequest(original, { nestedAttributesSuffix: false })).toEqual(converted);
    });
  });

  describe('when nestedAttributesSuffix is a string', function(){
    it('then returns the value with that string as the nested attributes suffix', function(){
      const original = {
        a: 'a',
        b: 1,
        c: null,
        d: undefined,
        e: {
          f: ['g', 'h', 'i'],
          j: [
            { k: 'k', l: 'l' }, { k: 'm', l: 'n' }, { k: 'o' }
          ]
        }
      };

      const converted = {
        a: 'a',
        b: 1,
        c: null,
        d: undefined,
        e_nested: {
          f: ['g', 'h', 'i'],
          j_nested: {
            0: { k: 'k', l: 'l' },
            1: { k: 'm', l: 'n' },
            2: { k: 'o' }
          }
        }
      };

      expect(railsRequest(original, { nestedAttributesSuffix: '_nested' })).toEqual(converted);
    });

  });

  describe('when attributeFormat is \'camelCase\'', function(){
    it('then returns the value with all the attribute names in camel case', function(){
      const original = {
        a_a: 'a',
        bB: 1,
        'c-C': null,
        d: undefined,
        e_e: {
          f: ['g', 'h', 'i'],
          j: [
            { k: 'k', l: 'l' }, { k: 'm', l: 'n' }, { k: 'o' }
          ]
        }
      };

      const converted = {
        aA: 'a',
        bB: 1,
        cC: null,
        d: undefined,
        eEAttributes: {
          f: ['g', 'h', 'i'],
          jAttributes: {
            0: { k: 'k', l: 'l' },
            1: { k: 'm', l: 'n' },
            2: { k: 'o' }
          }
        }
      };

      expect(railsRequest(original, { attributeFormat: 'camelCase' })).toEqual(converted);
    });

  });

  describe('when convertObjectArrays is false', function(){

    it('then returns the value with the complex arrays untouched', function(){
      const original = {
        a: 'a',
        b: 1,
        c: null,
        d: undefined,
        e: {
          f: ['g', 'h', 'i'],
          j: [
            { k: 'k', l: 'l' }, { k: 'm', l: 'n' }, { k: 'o' }
          ]
        }
      };

      const converted = {
        a: 'a',
        b: 1,
        c: null,
        d: undefined,
        e_attributes: {
          f: ['g', 'h', 'i'],
          j_attributes: [
            { k: 'k', l: 'l' }, { k: 'm', l: 'n' }, { k: 'o' }
          ]
        }
      };

      expect(railsRequest(original, { convertObjectArrays: false })).toEqual(converted);
    });

  });
});
