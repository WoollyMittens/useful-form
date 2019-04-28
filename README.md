# form.js: HTML5 Form Functionality

A form using HTML5 form elements, that validates both client- and server-side and stores the entries in XML.

Try the <a href="http://www.woollymittens.nl/default.php?url=useful-form">demo</a>.

Please note that the PHP form was created for demonstration purposes only.

## How to include the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="css/form.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="lib/positions.js"></script>
<script src="lib/transitions.js"></script>
<script src="js/form.js"></script>
```

Or use [Require.js](https://requirejs.org/).

```js
requirejs([
	'lib/positions.js',
	'lib/transitions.js',
	'js/form.js'
], function(positions, transitions, Form) {
	...
});
```

Or import into an MVC framework.

```js
var positions = require('lib/positions.js');
var transitions = require('lib/transitions.js');
var Form = require('js/form.js');
```

## How to start the script

```javascript
var form = new Form({
	'element' : document.getElementById('id'),
	'input' : 'input, select, textarea',
	'output' : 'div.summary',
	'message' : '<div class="failure"><h3>Please correct the following problem(s):</h3>{0}</div>'
});
```

**id : {string}** - The ID attribute of an element somewhere in the document.

**input : {string}** - A CSS Rule that describes the form elements.

**output : {string}** - A CSS Rule that describes the output area.

**message : {string}** - An HTML template for a validation error message.

## How to control the script

### Focus

```javascript
form.validateForm();
```

Performs the form validation manually.

## How to build the script

This project uses node.js from http://nodejs.org/

This project uses gulp.js from http://gulpjs.com/

The following commands are available for development:
+ `npm install` - Installs the prerequisites.
+ `gulp import` - Re-imports libraries from supporting projects to `./src/libs/` if available under the same folder tree.
+ `gulp dev` - Builds the project for development purposes.
+ `gulp dist` - Builds the project for deployment purposes.
+ `gulp watch` - Continuously recompiles updated files during development sessions.
+ `gulp serve` - Serves the project on a temporary web server at http://localhost:8500/.
+ `gulp php` - Serves the project on a temporary php server at http://localhost:8500/.

## License

This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
