import railsRequest from '../../index';

describe('changes', function () {

  describe('when comparing an array', function() {
    describe('and the original array is empty', function(){
      const original = [];

      describe('and elements have been added', function(){
        const changed = ['a'];
        const differences = ['a'];

        it('then returns a new array with the new elements', function(){
          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);
        });
       });
     });

    describe('and the original array contains only flat elements', function(){
      const original = ['a','b' ];

      describe('and an element has been added', function(){
        const changed = ['a', 'b', 'c' ];
        const differences = ['a', 'b', 'c' ];

        it('then returns the entire new array', function(){
          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);
        });

       });

      describe('and an element has been changed', function(){
        const changed = ['a', 'd', 'c' ];
        const differences = ['a', 'd', 'c' ];

        it('then returns the entire new array', function(){

          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);

        });
       });

      describe('and an element has been removed', function(){
        const changed = ['a'];
        const differences = ['a'];

        it('then returns the entire new array', function(){

          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);

        });
       });
     });

    describe('and the original array contains objects', function(){
      const original = [ { i: 1, a: 'a', b: 'b' }, { i: 2, c: 'c', d: 'd' }, { i: 3, e: 'e', f: 'f' }];

      describe('and objects are added', function(){
        const changed = [ { i: 1, a: 'a', b: 'b' }, { i: 2, c: 'c', d: 'd' }, { i: 3, e: 'e', f: 'f' }, { i: 4, g: 'g' }, { h: 'h' }];
        const differences = { 0: { i: 4, g: 'g' }, 1: { h: 'h' } };

        it('then returns a new array containing only the new objects', function(){

          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);

        });
       });

      describe('and a new object without an id is added to the front', function(){
        const changed = [ { g: 'g' }, { i: 1, a: 'a', b: 'b' }, { i: 2, c: 'c', d: 'd' }, { i: 3, e: 'e', f: 'f' } ];
        const differences = { 0: { g: 'g' } };

        it('then returns a new array containing only the new objects', function(){

          const changeObject = railsRequest(changed, { diff: original, identifiers: [ 'i' ] });

          expect(changeObject).toEqual(differences);

        });
       });

      describe('and a new object with an id is added to the front', function(){
        const changed = [ { i: 4, g: 'g' }, { i: 1, a: 'a', b: 'b' }, { i: 2, c: 'c', d: 'd' }, { i: 3, e: 'e', f: 'f' } ];
        const differences = { 0: { i: 4, g: 'g' } };

        it('then returns a new array containing only the new objects', function(){

          const changeObject = railsRequest(changed, { diff: original, identifiers: [ 'i' ] });

          expect(changeObject).toEqual(differences);

        });
       });

      describe('and an object changes', function(){
        const changed =  [ { i: 1, a: 'a', b: 'b' }, { i: 2, c: 'x', d: 'd' }, { i: 3, e: 'e', f: 'f' }];
        const differences = { 0: { c: 'x' } };

        it('then returns a new array containing only the changes on the object', function(){

          const changeObject = railsRequest(changed, { diff: original });

          expect(changeObject).toEqual(differences);

        });
       });

      describe('and an object is removed', function(){
        const changed =  [ { i: 1, a: 'a', b: 'b' }, { i: 3, e: 'e', f: 'f' } ];
        const differences = { 0: { i: 2, '_destroy': 1 } };

        describe('and only identifier fields that are present are included in the identifiers option', function(){
          it('then returns a new array containing a removal object for the removed object', function(){

            const changeObject = railsRequest(changed, { diff: original, identifiers: ['i'] });

            expect(changeObject).toEqual(differences);

          });
         });

        describe('and identifier fields not present are included in the identifiers option', function(){
          it('then returns a new array containing a removal object for the removed object', function(){

            const changeObject = railsRequest(changed, { diff: original, identifiers: ['i', 'x'] });

            expect(changeObject).toEqual(differences);

          });
         });

       });

      describe('when objects are added, removed and changed', function(){
        const changed = [ { i: 1, a: 'a', b: 'b' }, { i: 3, e: 'o', f: 'f' }, { k: 'k' }, { i: 4, g: 'g' }];
        const differences = { 0: { i: 3, e: 'o'}, 1: { k: 'k' }, 2: { i: 4, g: 'g' }, 3: { i: 2, '_destroy': 1 } };

        it('then returns an array containing only the changes', function(){
          const changeObject = railsRequest(changed, { diff: original, identifiers: 'i' });

          expect(changeObject).toEqual(differences);
        });

       });
     });
  });

});
