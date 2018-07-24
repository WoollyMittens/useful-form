/*
Source:
van Creij, Maurice (2018). "positions.js: A library of useful functions to ease working with screen positions.", http://www.woollymittens.nl/.

License:
This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var positions = {

	// find the dimensions of the window
	window: function (parent) {
		// define a position object
		var dimensions = {x: 0, y: 0};
		// if an alternative was given to use as a window
		if (parent && parent !== window && parent !== document) {
			// find the current dimensions of surrogate window
			dimensions.x = parent.offsetWidth;
			dimensions.y = parent.offsetHeight;
		} else {
			// find the current dimensions of the window
			dimensions.x = window.innerWidth || document.body.clientWidth;
			dimensions.y = window.innerHeight || document.body.clientHeight;
		}
		// return the object
		return dimensions;
	},

	// find the scroll position of an element
	document: function (parent) {
		// define a position object
		var position = {x: 0, y: 0};
		// find the current position in the document
		if (parent && parent !== window && parent !== document) {
			position.x = parent.scrollLeft;
			position.y = parent.scrollTop;
		} else {
			position.x = (window.pageXOffset) ?
			window.pageXOffset :
			(document.documentElement) ?
			document.documentElement.scrollLeft :
			document.body.scrollLeft;
			position.y = (window.pageYOffset) ?
			window.pageYOffset :
			(document.documentElement) ?
			document.documentElement.scrollTop :
			document.body.scrollTop;
		}
		// return the object
		return position;
	},

	// finds the position of the element, relative to the document
	object: function (node) {
		// define a position object
		var position = {x: 0, y: 0};
		// if offsetparent exists
		if (node.offsetParent) {
			// add every parent's offset
			while (node.offsetParent) {
				position.x += node.offsetLeft;
				position.y += node.offsetTop;
				node = node.offsetParent;
			}
		}
		// return the object
		return position;
	},

	// find the position of the mouse cursor relative to an element
	cursor: function (evt, parent) {
		// define a position object
		var position = {x: 0, y: 0};
		// find the current position on the document
		if (evt.touches && evt.touches[0]) {
			position.x = evt.touches[0].pageX;
			position.y = evt.touches[0].pageY;
		} else if (evt.pageX !== undefined) {
			position.x = evt.pageX;
			position.y = evt.pageY;
		} else {
			position.x = evt.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
			position.y = evt.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
		}
		// if a parent was given
		if (parent) {
			// retrieve the position of the parent
			var offsets = this.object(parent);
			// adjust the coordinates to fit the parent
			position.x -= offsets.x;
			position.y -= offsets.y;
		}
		// return the object
		return position;
	}

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = positions;
}

/*
	Source:
	van Creij, Maurice (2018). "transitions.js: A library of useful functions to ease working with CSS3 transitions.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var transitions = {

	// applies functionality to node that conform to a given CSS rule, or returns them
	select: function(input, parent) {
		var a,
			b,
			elements;
		// validate the input
		parent = parent || document.body;
		input = (typeof input === 'string')
			? {
				'rule': input,
				'parent': parent
			}
			: input;
		input.parent = input.parent || document;
		input.data = input.data || {};
		// use querySelectorAll to select elements, or defer to jQuery
		elements = (typeof(document.querySelectorAll) !== 'undefined')
			? input.parent.querySelectorAll(input.rule)
			: (typeof(jQuery) !== 'undefined')
				? jQuery(input.parent).find(input.rule).get()
				: [];
		// if there was a handler
		if (typeof(input.handler) !== 'undefined') {
			// for each element
			for (a = 0, b = elements.length; a < b; a += 1) {
				// run the handler and pass a unique copy of the data (in case it's a model)
				input.handler(elements[a], input.data.create());
			}
			// else assume the function was called for a list of elements
		} else {
			// return the selected elements
			return elements;
		}
	},

	// checks the compatibility of CSS3 transitions for this browser
	compatibility: function() {
		var eventName,
			newDiv,
			empty;
		// create a test div
		newDiv = document.createElement('div');
		// use various tests for transition support
		if (typeof(newDiv.style.MozTransition) !== 'undefined') {
			eventName = 'transitionend';
		}
		try {
			document.createEvent('OTransitionEvent');
			eventName = 'oTransitionEnd';
		} catch (e) {
			empty = null;
		}
		try {
			document.createEvent('WebKitTransitionEvent');
			eventName = 'webkitTransitionEnd';
		} catch (e) {
			empty = null;
		}
		try {
			document.createEvent('transitionEvent');
			eventName = 'transitionend';
		} catch (e) {
			empty = null;
		}
		// remove the test div
		newDiv = empty;
		// pass back working event name
		return eventName;
	},

	// performs a transition between two classnames
	byClass: function(element, removedClass, addedClass, endEventHandler, jQueryDuration, jQueryEasing) {
		var replaceThis,
			replaceWith,
			endEventName,
			endEventFunction;
		// validate the input
		endEventHandler = endEventHandler || function() {};
		endEventName = this.compatibility();
		// turn the classnames into regular expressions
		replaceThis = new RegExp(removedClass.trim().replace(/ {2,}/g, ' ').split(' ').join('|'), 'g');
		replaceWith = new RegExp(addedClass, 'g');
		// if CSS3 transitions are available
		if (typeof endEventName !== 'undefined') {
			// set the onComplete handler and immediately remove it afterwards
			element.addEventListener(endEventName, endEventFunction = function() {
				endEventHandler();
				element.removeEventListener(endEventName, endEventFunction, true);
			}, true);
			// replace the class name
			element.className = (element.className.replace(replaceThis, '') + ' ' + addedClass).replace(/ {2,}/g, ' ').trim();
			// else if jQuery UI is available
		} else if (typeof jQuery !== 'undefined' && typeof jQuery.ui !== 'undefined') {
			// retrieve any extra information for jQuery
			jQueryDuration = jQueryDuration || 500;
			jQueryEasing = jQueryEasing || 'swing';
			// use switchClass from jQuery UI to approximate CSS3 transitions
			jQuery(element).switchClass(removedClass.replace(replaceWith, ''), addedClass, jQueryDuration, jQueryEasing, endEventHandler);
			// if all else fails
		} else {
			// just replace the class name
			element.className = (element.className.replace(replaceThis, '') + ' ' + addedClass).replace(/ {2,}/g, ' ').trim();
			// and call the onComplete handler
			endEventHandler();
		}
	},

	// adds the relevant browser prefix to a style property
	prefix: function(property) {
		// pick the prefix that goes with the browser
		return (navigator.userAgent.match(/webkit/gi))
			? 'webkit' + property.substr(0, 1).toUpperCase() + property.substr(1)
			: (navigator.userAgent.match(/firefox/gi))
				? 'Moz' + property.substr(0, 1).toUpperCase() + property.substr(1)
				: (navigator.userAgent.match(/microsoft/gi))
					? 'ms' + property.substr(0, 1).toUpperCase() + property.substr(1)
					: (navigator.userAgent.match(/opera/gi))
						? 'O' + property.substr(0, 1).toUpperCase() + property.substr(1)
						: property;
	},

	// applies a list of rules
	byRules: function(element, rules, endEventHandler) {
		var rule,
			endEventName,
			endEventFunction;
		// validate the input
		rules.transitionProperty = rules.transitionProperty || 'all';
		rules.transitionDuration = rules.transitionDuration || '300ms';
		rules.transitionTimingFunction = rules.transitionTimingFunction || 'ease';
		endEventHandler = endEventHandler || function() {};
		endEventName = this.compatibility();
		// if CSS3 transitions are available
		if (typeof endEventName !== 'undefined') {
			// set the onComplete handler and immediately remove it afterwards
			element.addEventListener(endEventName, endEventFunction = function() {
				endEventHandler();
				element.removeEventListener(endEventName, endEventFunction, true);
			}, true);
			// for all rules
			for (rule in rules) {
				if (rules.hasOwnProperty(rule)) {
					// implement the prefixed value
					element.style[this.compatibility(rule)] = rules[rule];
					// implement the value
					element.style[rule] = rules[rule];
				}
			}
			// else if jQuery is available
		} else if (typeof jQuery !== 'undefined') {
			var jQueryEasing,
				jQueryDuration;
			// pick the equivalent jQuery animation function
			jQueryEasing = (rules.transitionTimingFunction.match(/ease/gi))
				? 'swing'
				: 'linear';
			jQueryDuration = parseInt(rules.transitionDuration.replace(/s/g, '000').replace(/ms/g, ''), 10);
			// remove rules that will make Internet Explorer complain
			delete rules.transitionProperty;
			delete rules.transitionDuration;
			delete rules.transitionTimingFunction;
			// use animate from jQuery
			jQuery(element).animate(rules, jQueryDuration, jQueryEasing, endEventHandler);
			// else
		} else {
			// for all rules
			for (rule in rules) {
				if (rules.hasOwnProperty(rule)) {
					// implement the prefixed value
					element.style[this.compatibility(rule)] = rules[rule];
					// implement the value
					element.style[rule] = rules[rule];
				}
			}
			// call the onComplete handler
			endEventHandler();
		}
	}

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = transitions;
}

/*
	Source:
	van Creij, Maurice (2018). "form.js: Client side form validation", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Form = function (config) {

	// PROPERTIES

	// METHODS

	this.init = function (config) {
		// store the config
		this.config = config;
		this.element = config.element;
		// set the form submit event
		this.element.addEventListener('submit', this.onFormSubmitted.bind(this), false);
		// make a place to store the flag
		this.config.flag = null;
		// for all the fields
		this.config.fields = transitions.select(this.config.input, this.element);
		for (var a = 0, b = this.config.fields.length; a < b; a += 1) {
			// set the field change event
			this.config.fields[a].addEventListener('change', this.onFieldChanged.bind(this, this.config.fields[a]), false);
		}
		// store the summary space
		this.config.summary = transitions.select(this.config.output, this.element);
		// note that the form has not yet been submitted
		this.config.submitted = false;
		// return the object
		return this;
	};

	this.validateField = function (element, strict) {
		// get the element properties
		var peers, a, b,
			passed = true,
			pattern = new RegExp(element.getAttribute('pattern') || '^.+$'),
			checkable = new RegExp('radio|checkbox', 'i');
		// if the field is visible
		if (element.offsetWidth > 0) {
			// if the element can be checked and is required
			if (checkable.test(element.getAttribute('type')) && element.required) {
				// get the peers of the field
				peers = document.getElementsByName(element.getAttribute('name'));
				// if any of the peers are checked
				passed = false;
				for (a = 0, b = peers.length; a < b; a += 1) {
					// approve the result
					passed = passed || peers[a].checked;
				}
			// or the field is not empty
			} else if (element.value) {
				// validate the field against its pattern
				passed = pattern.test(element.value);
			// or the field is empty and the validation is strict and the field is required
			} else if (strict && element.required) {
				// reject the result
				passed = false;
			}
		}
		// return the result
		return {'element' : element, 'passed' : passed, 'message' : element.getAttribute('data-message')};
	};

	this.flagField = function (result) {
		console.log(result);
		var position = positions.object(result.element);
		// remove any old flag
		this.unflagField();
		// construct the flag
		this.config.flag = document.createElement('div');
		this.config.flag.className = 'form-flag form-flag-hidden';
		this.config.flag.innerHTML = result.message;
		document.body.appendChild(this.config.flag);
		// position the flag near the bottom and centre of the field
		this.config.flag.style.position = 'absolute';
		this.config.flag.style.left = (position.x + result.element.offsetWidth / 2 - this.config.flag.offsetWidth / 2) + 'px';
		this.config.flag.style.top = (position.y + result.element.offsetHeight) + 'px';
		// reveal the flag
		this.config.flag.className = 'form-flag form-flag-visible';
	};

	this.unflagField = function () {
		// remove the flag from any field
		if (this.config.flag !== null) {
			this.config.flag.parentNode.removeChild(this.config.flag);
			this.config.flag = null;
		}
	};

	this.markField = function (result) {
		result.element.className = result.element.className.replace(/ error/g, '') + ' error';
	};

	this.unmarkField = function (result) {
		result.element.className = result.element.className.replace(/ error/g, '');
	};

	this.validateForm = function () {
		var a, b, summary = '', result, first = true;
		// remove the flag
		this.unflagField();
		// check all fields strictly
		for (a = 0, b = this.config.fields.length; a < b; a += 1) {
			result = this.validateField(this.config.fields[a], true);
			// if the check fails
			if (!result.passed) {
				// mark the field
				this.markField(result);
				// add to the summary
				summary += '<li>' + result.message + '</li>';
				// if this is the first check that fails
				if (first) {
					// flag it
					this.flagField(result);
					// no longer the first
					first = false;
				}
			// else
			} else {
				// unmark the field
				this.unmarkField(result);
			}
		}
		// report a summary
		if (this.config.summary.length > 0) {
			this.config.summary[0].innerHTML = (summary !== '') ? this.config.message.replace(/\{0\}/g, '<ul>' + summary + '</ul>') : '';
		}
		// return result
		return (summary === '');
	};

	// EVENTS

	this.onFieldChanged = function (element) {
		var result;
		// if the form was previously submitted
		if (this.config.submitted) {
			// recheck the whole thing
			this.validateForm();
		// else check just this field
		} else {
			// check the field
			result = this.validateField(element, false);
			// flag the field
			if (!result.passed) {
				this.markField(result);
				this.flagField(result);
			} else {
				this.unmarkField(result);
				this.unflagField();
			}
		}
	};

	this.onFormSubmitted = function (evt) {
		// note that the form has been submitted once
		this.config.submitted = true;
		// check the form
		var result = this.validateForm();
		// allow the submit or not
		if (!result) { evt.preventDefault(); }
	};

	this.init(config);
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = Form;
}
