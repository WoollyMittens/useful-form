# form.js: HTML5 Form Functionality

*DEPRICATION WARNING: the functionality in this script has been superceeded / trivialised by updated web standards.*

A form using HTML5 form elements, that validates both client- and server-side and stores the entries in XML.

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

Or use imported as a component in existing projects.

```js
@import {positions = require('lib/positions.js";
@import {transitions = require('lib/transitions.js";
@import {Form} from "js/form.js";
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

## License

This work is licensed under a [MIT License](https://opensource.org/licenses/MIT). The latest version of this and other scripts by the same author can be found on [Github](https://github.com/WoollyMittens).
