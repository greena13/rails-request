import railsRequest from '../../rails-request.development';
import each from 'lodash.foreach';

describe('changes', function () {
  describe('when comparing an object', function() {
    describe('and the original object is empty', function(){
      const original = {};

      describe('and attributes have been added', function(){
        const changed = { a: 'a' };

        it('returns a new object with the changed attributes', function(){
          const changeObject = railsRequest(changed, { diff: original });

          each(changeObject, (value, key) => {
            expect(value).toEqual(changed[key]);
          })
        });
       });
     });

    describe('when the original object is not empty', function(){
      const original = { a: 'a', b: 'b' };

      describe('and an attribute has been added', function(){
        const changed = { a: 'a', b: 'b', c: 'c' };
        const differences = { c: 'c' };

        it('returns a new object containing only the changed attributes', function(){
          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);
        });

       });

      describe('and an attribute has been changed', function(){
        const changed = { a: 'a', b: 'd' };
        const differences = { b: 'd' };

        it('returns a new object containing only the changed value', function(){

          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);

        });
       });

      describe('and an attribute has been removed', function(){
        const changed = { a: 'a' };
        const differences = null;

        it('returns null', function(){

          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);

        });
       });
     });

    describe('and the original object has a nested object', function(){
      const original = { a: 'a', b: { c: 'c', d: 'd' } };

      describe('and the nested object changes', function(){
        const changed =  { a: 'a', b: { c: 'c', d: 'e' } };
        const differences = { b_attributes: { d: 'e' } };

        it('returns a new object containing only the nested changes', function(){

          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);

        });
       });

      describe('and the nested object is removed', function(){
        const changed =  { a: 'a'  };
        const differences = null;

        it('returns null', function(){

          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);

        });

       });
     });

  });

});
