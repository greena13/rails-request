'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/rails-request.production.min.js');
} else {
  module.exports = require('./cjs/rails-request.development.js');
}
