/*
	Source:
	van Creij, Maurice (2012). "useful.form.js: Client side form validation", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// private functions
	useful.Form = function (obj, cfg) {
		this.obj = obj;
		this.cfg = cfg;
		// setup
		this.start = function () {
			// set the form submit event
			this.obj.addEventListener('submit', this.onFormSubmitted(), false);
			// make a place to store the flag
			this.cfg.flag = null;
			// for all the fields
			this.cfg.fields = useful.transitions.select(this.cfg.input, this.obj);
			for (var a = 0, b = this.cfg.fields.length; a < b; a += 1) {
				// set the field change event
				this.cfg.fields[a].addEventListener('change', this.onFieldChanged(this.cfg.fields[a]), false);
			}
			// store the summary space
			this.cfg.summary = useful.transitions.select(this.cfg.output, this.obj);
			// note that the form has not yet been submitted
			this.cfg.submitted = false;
			// disable the start function so it can't be started twice
			this.start = function () {};
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
			var position = useful.positions.object(result.element);
			// remove any old flag
			this.unflagField();
			// construct the flag
			this.cfg.flag = document.createElement('div');
			this.cfg.flag.className = 'form-flag form-flag-hidden';
			this.cfg.flag.innerHTML = result.message;
			document.body.appendChild(this.cfg.flag);
			// position the flag near the bottom and centre of the field
			this.cfg.flag.style.position = 'absolute';
			this.cfg.flag.style.left = (position.x + result.element.offsetWidth / 2 - this.cfg.flag.offsetWidth / 2) + 'px';
			this.cfg.flag.style.top = (position.y + result.element.offsetHeight) + 'px';
			// reveal the flag
			this.cfg.flag.className = 'form-flag form-flag-visible';
		};
		this.unflagField = function () {
			// remove the flag from any field
			if (this.cfg.flag !== null) {
				this.cfg.flag.parentNode.removeChild(this.cfg.flag);
				this.cfg.flag = null;
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
			for (a = 0, b = this.cfg.fields.length; a < b; a += 1) {
				result = this.validateField(this.cfg.fields[a], true);
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
			if (this.cfg.summary.length > 0) {
				this.cfg.summary[0].innerHTML = (summary !== '') ? this.cfg.message.replace(/\{0\}/g, '<ul>' + summary + '</ul>') : '';
			}
			// return result
			return (summary === '');
		};
		this.onFieldChanged = function (element) {
			var result, context = this;
			return function () {
				// if the form was previously submitted
				if (context.cfg.submitted) {
					// recheck the whole thing
					context.validateForm();
				// else check just this field
				} else {
					// check the field
					result = context.validateField(element, false);
					// flag the field
					if (!result.passed) {
						context.markField(result);
						context.flagField(result);
					} else {
						context.unmarkField(result);
						context.unflagField();
					}
				}
			};
		};
		this.onFormSubmitted = function () {
			var context = this;
			return function (event) {
				// note that the form has been submitted once
				context.cfg.submitted = true;
				// check the form
				var result = context.validateForm();
				// allow the submit or not
				if (!result) { event.preventDefault(); }
			};
		};
		// go
		this.start();
	};

}(window.useful = window.useful || {}));
