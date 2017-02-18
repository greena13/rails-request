# rails-request

Utility for producing a Rails-compatible object from a JavaScript or JSON one; perfect for create (POST) or update (PUT) endpoints.

## Usage

```javascript
import railsRequest from 'rails-request';

const railsObject = railsRequest(obj);
```

## Creation objects

By default, calling `rails-request` with a JavaScript object will recursively convert your object to one that uses Rails-friendly attribute names and conventions. In particular:
 
* Attribute names will be snake cased
* A `_attributes` suffix will be added to all nested objects if not already present
* Arrays of nested objects will be converted to hashes with index keys
 
```javascript
const jsObject = {
  userName: 'user123',
  address: {
    line1: '1 Street',
    line2: 'City, Country'
  },
  achievementIds: [3,5],
  photos: [
    { id: 23, url: 'http://url.com/123' },    
    { id: 25, url: 'http://url.com/123' }    
  ]
}; 

const railsObject = railsRequest(jsObject);

railsObject === {
  user_name: 'user123',
  address_attributes: {
    line1: '1 Street',
    line2: 'City, Country'  
  },
  achievement_ids: [3,5],
  photos_attributes: {
    0: { id: 23, url: 'http://url.com/123' },
    1: { id: 25, url: 'http://url.com/123' }
  }
}
```

### Customising creation objects

You can start to deviate from Rail's conventions if you need to do so by passing options as a second argument.


#### Setting nested attribute suffix
 
```javascript
const jsObject = {
  userName: 'user123',
  address: {
    line1: '1 Street',
    line2: 'City, Country'
  },
  achievementIds: [3,5],
  photos: [
    { id: 23, url: 'http://url.com/123' },    
    { id: 25, url: 'http://url.com/123' }    
  ]
};

const railsObject = railsRequest(jsObject, { nestedAttributesSuffix: false });

railsObject === {
  user_name: 'user123',
  address: {
    line1: '1 Street',
    line2: 'City, Country'  
  },
  achievement_ids: [3,5],
  photos: {
    0: { id: 23, url: 'http://url.com/123' },
    1: { id: 25, url: 'http://url.com/123' }
  }
}

const railsObject = railsRequest(jsObject, { nestedAttributesSuffix: '_fields' });

railsObject === {
  user_name: 'user123',
  address_fields: {
    line1: '1 Street',
    line2: 'City, Country'  
  },
  achievement_ids: [3,5],
  photos_fields: {
    0: { id: 23, url: 'http://url.com/123' },
    1: { id: 25, url: 'http://url.com/123' }
  }
}
```

#### Changing attribute name format

Currently only `camelCase` and `snakeCase` (default) are supported.

```javascript
const jsObject = {
  userName: 'user123',
  address: {
    line1: '1 Street',
    line2: 'City, Country'
  },
  achievementIds: [3,5],
  photos: [
    { id: 23, url: 'http://url.com/123' },    
    { id: 25, url: 'http://url.com/123' }    
  ]
};

const railsObject = railsRequest(jsObject, { attributeFormat: 'camelCase' });

railsObject === {
  userName: 'user123',
  addressAttributes: {
    line1: '1 Street',
    line2: 'City, Country'  
  },
  achievementIds: [3,5],
  photosAttributes: {
    0: { id: 23, url: 'http://url.com/123' },
    1: { id: 25, url: 'http://url.com/123' }
  }
}
```

## Update Objects

`rails-request` provides a `diff` option for generating update objects, which:

* Returns only the changes between two objects to reduce request payload
* Always includes identifier fields when needed
* Correctly sets destroy objects when nested objects have been removed from arrays

```javascript
const jsObject = {
  userName: 'user123',
  address: {
    id: 3,
    line1: '1 Street',
    line2: 'City, Country'
  },
  achievementIds: [3,5],
  photos: [
    { id: 23, url: 'http://url.com/123' },    
    { id: 25, url: 'http://url.com/123' }    
  ]
}; 

const newJsObject = {
  userName: 'user4',
  address: {
    id: 3,
    line1: '2 Street',
    line2: 'City, Country'
  },
  achievementIds: [3,5,7],
  photos: [
    { id: 25, url: 'http://url.com/123' }    
  ]
}; 

const railsObject = railsRequest(newJsObject, { diff: jsObject });

railsObject === {
  user_name: 'user4', 
  address_attributes: {
    id: 3,
    line1: '2 Street'
  },
  achievement_ids: [3,5,7],
  photos_attributes: [
    { id: 23, _destroy: 1 }    
  ]
}
```

### Customising update objects

Like creation objects, you can customise update objects if you need to. In addition to those listed below, you can also use any of the options mentioned above for creation objects.

#### Changing identifier fields

By default, `rails-request` will use `id` as the only identifier field. You can add extra fields, or use alternative fields if you wish:

```javascript
const jsObject = {
  photos: [
    { externalId: 23, url: 'http://url.com/123' },    
    { externalId: 25, url: 'http://url.com/123' }    
  ]
}; 

const newJsObject = {
  photos: [
    { externalId: 25, url: 'http://url.com/123' }    
  ]
}; 

const railsObject = railsRequest(newJsObject, { diff: jsObject, identifiers: [ 'externalId'] });

railsObject === {
  photos_attributes: [
    { external_id: 23, _destroy: 1 }    
  ]
}
```

#### Customising destroy objects

```javascript
const jsObject = {
  photos: [
    { id: 23, url: 'http://url.com/123' },    
    { id: 25, url: 'http://url.com/123' }    
  ]
}; 

const newJsObject = {
  photos: [
    { id: 25, url: 'http://url.com/123' }    
  ]
}; 

const railsObject = railsRequest(newJsObject, { diff: jsObject, destroyAttributeValue: true });

railsObject === {
  photos_attributes: [
    { id: 23, _destroy: true }    
  ]
};

const railsObject = railsRequest(newJsObject, { diff: jsObject, destroyAttributeName: 'delete' });

railsObject === {
  photos_attributes: [
    { id: 23, delete: 1 }    
  ]
};
```

## Running the test suite

```bash
npm run tests
```
