import railsRequest from '../../index';

describe('comparing two objects', function(){
  const original = {
    a: 'a',
    b: [
      {
        id: 'c',
        d: 'd'
      },
      {
        id: 'e',
        d: 'e'
      },
      {
        id: 'f',
        d: 'g'
      }
    ]
  };

  const changed = {
    a: 'a',
    b: [
      {
        id: 'c',
        d: 'd'
      },
      {
        id: 'f',
        d: 'g'
      }
    ]
  };

  describe('when the', function(){
    describe('destroyAttributeName and destroyAttributeValue are unspecified', function(){
      it('then uses a destroy object of { _destroy: 1 }', function(){
        const changes = {
          b_attributes: { 0: { id: 'e', _destroy: 1 } }
        };

        const actualChanges = railsRequest(changed, { diff: original });
        expect(actualChanges).toEqual(changes);
      });
    });

    describe('destroyAttributeName is a string', function(){
      it('then user the attribute name in destroy objects', function(){
        const changes = {
          b_attributes: { 0: { id: 'e', delete: 1 } }
        };

        const actualChanges = railsRequest(changed, { diff: original, destroyAttributeName: 'delete' });
        expect(actualChanges).toEqual(changes);
      });
    });

    describe('destroyAttributeValue is specified', function(){

      it('then uses that value in destroy objects', function(){
        const changes = { b_attributes: { 0: { id: 'e', _destroy: true } } };

        const actualChanges = railsRequest(changed, { diff: original, destroyAttributeValue: true });
        expect(actualChanges).toEqual(changes);
      });

    });
  });

  describe('when the identifiers option is not specified', function(){
    it('then uses id as default', function(){
      const changes = {
        b_attributes: { 0: { id: 'e', _destroy: 1 } }
      };

      const actualChanges = railsRequest(changed, { diff: original });
      expect(actualChanges).toEqual(changes);
    });
   });

  describe('when the identifiers option is an array', function(){
    it('then uses the elements in the array as identifiers', function(){
      const changes = {
        b_attributes: { 0: { d: 'e', _destroy: 1 } }
      };

      const actualChanges = railsRequest(changed, { diff: original , identifiers: ['d'] });
      expect(actualChanges).toEqual(changes);
    });
   });

  describe('when the nestedAttributesSuffix and attributeFormat are not specified', function(){
    it('then applies the suffix _attributes to nested objects', function(){
      const changes = {
        b_attributes: { 0: { id: 'e', _destroy: 1 } }
      };

      const actualChanges = railsRequest(changed, { diff: original });
      expect(actualChanges).toEqual(changes);
    });
   });

  describe('when the nestedAttributeSuffix is false', function(){
    it('then does not apply a suffix to nested objects', function(){
      const changes = {
        b: { 0: { id: 'e', _destroy: 1 } }
      };

      const actualChanges = railsRequest(changed, { diff: original, nestedAttributesSuffix: false });
      expect(actualChanges).toEqual(changes);
    });
   });

  describe('when the nestedAttributeSuffix is a string', function(){
    it('then applies that string as the suffix to nested objects', function(){
      const changes = {
        b_fields: { 0: { id: 'e', _destroy: 1 } }
      };

      const actualChanges = railsRequest(changed, { diff: original, nestedAttributesSuffix: '_fields' });
      expect(actualChanges).toEqual(changes);
    });
   });

  describe('when the attributeFormat option is camelCase', function(){
    it('then converts the nested objects suffix to camelCase (with the exception of the destroy attribute name)', function(){
      const changes = {
        bAttributes: { 0: { id: 'e', _destroy: 1 } }
      };

      const actualChanges = railsRequest(changed, { diff: original, attributeFormat: 'camelCase' });
      expect(actualChanges).toEqual(changes);
    });
   });
 });
