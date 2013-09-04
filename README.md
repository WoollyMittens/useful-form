# useful.form.js: HTML5 Form Functionality

A form using HTML5 form elements, that validates both client- and server-side and stores the entries in XML.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=form">form demo</a>.

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

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*. To provide an alternative for *document.querySelectorAll* and CSS3 animations in Internet Explorer 8 and lower, include *jQuery*.

```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<![endif]-->
```

## How to start the script

This is the safest way of starting the script, but allows for only one target element at a time.

```javascript
var form = new useful.Form( document.getElementById('id'), {
	'input' : 'input, select, textarea',
	'output' : 'div.summary',
	'failure' : '<div class="failure"><h3>Please correct the following problem(s):</h3>{0}</div>',
	'success' : '<div class="success"><h3>The form has been received successfully.</h3>{0}</div>',
	'ajax' : false,
	'url' : null,
	'method' : null
});
form.start();
```

**id : {string}** - The ID attribute of an element somewhere in the document.

**input : {string}** - A CSS Rule that describes the form elements within *parent*.

**output : {string}** - A CSS Rule that describes the output area within the *parent*.

**failure : {string}** - An HTML template for a validation error message.

**success : {string}** - An HTML template for confirming a successful submission.

**ajax : {boolean}** - Whether the form is to be submitted using AJAX.

**url : {string}** - The URL of the web-service to be used for a form submission using AJAX.

**method : {string}** - Can be either POST or GET. The default method is GET.

## License
This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
