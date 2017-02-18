import railsRequest from '../../index';

describe('changes', function () {
  describe('when comparing a string value', function() {

    describe('when the original value is truthy', function(){
      const original = 'string';

      describe('and the value has not changed', function() {
        const changed = original;

        it('returns null', function () {
          expect(railsRequest(changed, { diff: original })).toEqual(null);
        });

      });

      describe('when the value has changed', function(){
        const changed = 'new-string';

        it('returns the new value', function(){
          expect(railsRequest(changed, { diff: original })).toEqual(changed);
        });
       });
     });

    describe('when the original value is falesy', function(){
      const original = '';

      describe('and the value has not changed', function() {
        const changed = original;

        it('returns null', function () {
          expect(railsRequest(changed, { diff: original })).toEqual(null);
        });

      });

      describe('when the value has changed', function(){
        const changed = 'new-string';

        it('returns the new value', function(){
          expect(railsRequest(changed, { diff: original })).toEqual(changed);
        });
      });
    });

  });

  describe('when comparing an integer value', function() {

    describe('when the original value is truthy', function(){
      const original = 1;

      describe('and the value has not changed', function() {
        const changed = original;

        it('returns null', function () {
          expect(railsRequest(changed, { diff: original })).toEqual(null);
        });

      });

      describe('when the value has changed', function(){
        const changed = 2;

        it('returns the new value', function(){
          expect(railsRequest(changed, { diff: original })).toEqual(changed);
        });
       });
     });

    describe('when the original value is falesy', function(){
      const original = 0;

      describe('and the value has not changed', function() {
        const changed = original;

        it('returns null', function () {
          expect(railsRequest(changed, { diff: original })).toEqual(null);
        });

      });

      describe('when the value has changed', function(){
        const changed = 1;

        it('returns the new value', function(){
          expect(railsRequest(changed, { diff: original })).toEqual(changed);
        });
      });
    });

  });

  describe('when comparing a boolean value', function() {

    describe('when the original value is truthy', function(){
      const original = true;

      describe('and the value has not changed', function() {
        const changed = original;

        it('returns null', function () {
          expect(railsRequest(changed, { diff: original })).toEqual(null);
        });

      });

      describe('when the value has changed', function(){
        const changed = false;

        it('returns the new value', function(){
          expect(railsRequest(changed, { diff: original })).toEqual(changed);
        });
       });
     });

    describe('when the original value is falesy', function(){
      const original = false;

      describe('and the value has not changed', function() {
        const changed = original;

        it('returns null', function () {
          expect(railsRequest(changed, { diff: original })).toEqual(null);
        });

      });

      describe('when the value has changed', function(){
        const changed = true;

        it('returns the new value', function(){
          expect(railsRequest(changed, { diff: original })).toEqual(changed);
        });
      });
    });

  });

  describe('when comparing a null value', function() {

    const original = null;

    describe('and the value has not changed', function() {
      const changed = original;

      it('returns null', function () {
        expect(railsRequest(changed, { diff: original })).toEqual(null);
      });

    });

    describe('when the value has changed', function(){
      const changed = undefined;

      it('returns the new value', function(){
        expect(railsRequest(changed, { diff: original })).toEqual(changed);
      });
    });

  });

  describe('when comparing an undefined value', function() {

    const original = undefined;

    describe('and the value has not changed', function() {
      const changed = original;

      it('returns null', function () {
        expect(railsRequest(changed, { diff: original })).toEqual(null);
      });

    });

    describe('when the value has changed', function(){
      const changed = null;

      it('returns the new value', function(){
        expect(railsRequest(changed, { diff: original })).toEqual(changed);
      });
    });

  });

});
