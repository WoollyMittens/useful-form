# useful.form.js: HTML5 Form Functionality

A form using HTML5 form elements, that validates both client- and server-side and stores the entries in XML.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=useful-form">demo</a>.

Please note that the PHP form was created for demonstration purposes only.

## How to include the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/form.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/form.min.js"></script>
```

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*.
```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
```

## How to start the script

```javascript
var form = new useful.Form( document.getElementById('id'), {
	'input' : 'input, select, textarea',
	'output' : 'div.summary',
	'message' : '<div class="failure"><h3>Please correct the following problem(s):</h3>{0}</div>'
});
form.start();
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

## Prerequisites

To concatenate and minify the script yourself, the following prerequisites are required:
+ https://github.com/WoollyMittens/useful-positions
+ https://github.com/WoollyMittens/useful-transitions
+ https://github.com/WoollyMittens/useful-polyfills

## License
This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
