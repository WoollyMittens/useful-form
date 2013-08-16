# useful.form.js: HTML5 Form Functionality

A form using HTML5 form elements, that validates both client- and server-side and stores the entries in XML.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=form">form demo</a>.

Please note that the PHP form was created for demonstration purposes only.

## How to use the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/form.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/useful.form.js"></script>
```

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*. To provide an alternative for *document.querySelectorAll* and CSS3 animations in Internet Explorer 8 and lower, include *jQuery*.

```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<![endif]-->
```

### Using vanilla JavaScript

This is the safest way of starting the script, but allows for only one target element at a time.

```javascript
var parent = documentGetElementById('id');
useful.form.setup(parent, {
	'input' : 'input, select, textarea',
	'output' : 'div.summary',
	'failure' : '<div class="failure"><h3>Please correct the following problem(s):</h3>{0}</div>',
	'success' : '<div class="success"><h3>The form has been received successfully.</h3>{0}</div>',
	'ajax' : false,
	'url' : null,
	'method' : null
});
```

**id : {string}** - The ID attribute of an element somewhere in the document.

**parent : {DOM node}** - The DOM element around which the functionality is centred.

**input : {string}** - A CSS Rule that describes the form elements within *parent*.

**output : {string}** - A CSS Rule that describes the output area within the *parent*.

**failure : {string}** - An HTML template for a validation error message.

**success : {string}** - An HTML template for confirming a successful submission.

**ajax : {boolean}** - Whether the form is to be submitted using AJAX.

**url : {string}** - The URL of the web-service to be used for a form submission using AJAX.

**method : {string}** - Can be either POST or GET. The default method is GET.

```javascript
var parent = documentGetElementById('id');
useful.placeholder.init(parent, {
	'color' : '#999',
	'support' : navigator.userAgent.match(/webkit|firefox|opera|msie 10/gi),
	'offsetX' : 10,
	'offsetY' : 30
});
```

**color : {string}** - A colour in hex format for the placeholder text.

**support : {boolean}** - A test to determine which browsers have native support for the placeholder feature.

**offsetX : {integer}** - A fudge value in pixels to help precise horizontal positioning of the placeholder text.

**offsetY : {integer}** - A fudge value in pixels to help precise vertical positioning of the placeholder text.

```javascript
var parent = documentGetElementById('id');
useful.color.init(parent, {
	'color' : '#FF0000',
	'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
});
```

**color : {string}** - A colour in hex format for the placeholder text.

**support : {boolean}** - A test to determine which browsers have native support for the color input element.

```javascript
var parent = documentGetElementById('id');
useful.date.init(parent, {
	'years' : [20, -120],
	'months' : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	'days' : ['s', 'm', 't', 'w', 't', 'f', 's'],
	'format' : 'd/m/y',
	'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
});
```

**years : {array}** - The offsets between the current year and the maximum and minimum year.

**months : {array}** - The names of the months for use in labels.

**days : {array}** - The names of the days for use in labels.

**format : {string}** - The expected format of the date.

**support : {boolean}** - A test to determine which browsers have native support for the date input element.

```javascript
var parent = documentGetElementById('id');
useful.range.init(parent, {
	'title' : '{value}% ({min}-{max})',
	'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
});
```

**title : {string}** - The text format of the popup label of the input element.

**support : {boolean}** - A test to determine which browsers have native support for the range input element.

```javascript
var parent = documentGetElementById('id');
useful.file.init(parent, {});
```

### Using document.querySelectorAll

This method allows CSS Rules to be used to apply the script to one or more nodes at the same time.

```javascript
useful.css.select({
	rule : 'form',
	handler : useful.form.setup,
	data : {
		'input' : 'input, select, textarea',
		'output' : 'div.summary',
		'failure' : '<div class="failure"><h3>Please correct the following problem(s):</h3>{0}</div>',
		'success' : '<div class="success"><h3>The form has been received successfully.</h3>{0}</div>',
		'ajax' : false,
		'url' : null,
		'method' : null
	}
});
```

```javascript
useful.css.select({
	rule : 'input, textarea',
	handler : useful.placeholder.init,
	data : {
		'color' : '#999',
		'support' : navigator.userAgent.match(/webkit|firefox|opera|msie 10/gi),
		'offsetX' : 10,
		'offsetY' : 30
	}
});
```

```javascript
useful.css.select({
	rule : 'input.color',
	handler : useful.color.init,
	data : {
		'color' : '#FF0000',
		'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
	}
});
```

```javascript
useful.css.select({
	rule : 'input.date',
	handler : useful.date.init,
	data : {
		'years' : [20, -120],
		'months' : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		'days' : ['s', 'm', 't', 'w', 't', 'f', 's'],
		'format' : 'd/m/y',
		'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
	}
});
```

```javascript
useful.css.select({
	rule : 'input.range',
	handler : useful.range.init,
	data : {
		'title' : '{value}% ({min}-{max})',
		'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
	}
});
```

```javascript
useful.css.select({
	rule : 'input.file',
	handler : useful.file.init,
	data : {}
});
```

### Using jQuery

This method is similar to the previous one, but uses jQuery for processing the CSS rule.

```javascript
$('form').each(function (index, element) {
	useful.form.setup(element, {
		'input' : 'input, select, textarea',
		'output' : 'div.summary',
		'failure' : '<div class="failure"><h3>Please correct the following problem(s):</h3>{0}</div>',
		'success' : '<div class="success"><h3>The form has been received successfully.</h3>{0}</div>',
		'ajax' : false,
		'url' : null,
		'method' : null
	});
});
```

```javascript
$('input, textarea').each(function (index, element) {
	useful.placeholder.init(element, {
		'color' : '#999',
		'support' : navigator.userAgent.match(/webkit|firefox|opera|msie 10/gi),
		'offsetX' : 10,
		'offsetY' : 30
	});
});
```

```javascript
$('input.color').each(function (index, element) {
	useful.color.init(element, {
		'color' : '#FF0000',
		'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
	});
});
```

```javascript
$('input.date').each(function (index, element) {
	useful.date.init(element, {
		'years' : [20, -120],
		'months' : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		'days' : ['s', 'm', 't', 'w', 't', 'f', 's'],
		'format' : 'd/m/y',
		'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
	});
});
```

```javascript
$('input.range').each(function (index, element) {
	useful.range.init(element, {
		'title' : '{value}% ({min}-{max})',
		'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
	});
});
```

```javascript
$('input.file').each(function (index, element) {
	useful.file.init(element, {
		data : {}
	});
});
```

## License
This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
