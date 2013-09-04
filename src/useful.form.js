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
			// make a place to store the flags
			this.cfg.flags = {};
			// for all the fields
			this.cfg.fields = [];
			var allFields = this.obj.getElementsByTagName('*');
			var fieldTest = new RegExp('input|textarea|select', 'i');
			for (var a = 0, b = allFields.length; a < b; a += 1) {
				// if this is an input field
				if (fieldTest.test(allFields[a].nodeName)) {
					// store the field for later use
					this.cfg.fields.push(allFields[a]);
					// set the field change event
					allFields[a].addEventListener('change', this.onFieldChanged(allFields[a]), false);
				}
			}
		};
		this.validateField = function (element, strict) {
			// get the element properties
			var peers, a, b,
				passed = true,
				pattern = new RegExp(element.getAttribute('pattern') || '^.+$'),
				checkable = new RegExp('radio|checkbox', 'i');
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
			// return the result
			return {'element' : element, 'passed' : passed, 'message' : element.getAttribute('data-message')};
		};
		this.flagField = function (result) {
			// TODO: add + store / remove validation flag at first instance of the named element
		};
		this.validateForm = function () {
			// check all fields strictly
			// report a summary
			// return the result
			return false;
		};
		this.onFieldChanged = function (element) {
			var result, context = this;
			return function (event) {
				// check the field
				result = context.validateField(element, false);
				// flag the field
				context.flagField(result);
			};
		};
		this.onFormSubmitted = function () {
			var context = this;
			return function (event) {
				// check the form
				var result = context.validateForm();
				// allow the submit or not
				if (!result) { event.preventDefault(); }
			};
		};
	};

}(window.useful = window.useful || {}));
