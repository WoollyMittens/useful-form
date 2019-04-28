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
if (typeof define != 'undefined') define([], function () { return Form });
if (typeof module != 'undefined') module.exports = Form;
