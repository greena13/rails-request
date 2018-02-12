import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import license from 'rollup-plugin-license';
import path from 'path';

export default {
  input: 'src/index.js',

  output: {
    format: 'cjs',
    file: process.env.NODE_ENV === 'production' ? 'cjs/rails-request.production.min.js' : 'cjs/rails-request.development.js',
    exports: 'named'
  },
  external: [
   'lodash.some',
   'lodash.has',
   'lodash.find',
   'lodash.without',
   'lodash.reduce',
   'lodash.foreach',
   'lodash.map',
   'lodash.isundefined',
   'lodash.isplainobject',
   'lodash.size',
   'lodash.camelcase',
   'lodash.snakecase',
   'lodash.endswith'
  ],
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),

    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),

    (process.env.NODE_ENV === 'production' && uglify()),

    license({
      banner: {
        file: path.join(__dirname, 'LICENSE')
      }
    })
  ]
};
