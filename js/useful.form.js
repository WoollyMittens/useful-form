/*
	Source:
	van Creij, Maurice (2012). "useful.form.js: Commonly reused functionality for forms in HTML5.", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Prerequisites:
	<script src="./js/useful.js"></script>
*/

(function (useful) {

	/*
		invoke strict mode
	*/
	"use strict";

	/*
		Form validation - version 20121126
	*/

	// private functions
	var form = {};
	form = {
		// setup
		setup : function (view, model) {
			var a, b, elements;
			// store the view
			model.parent = view;
			form.events.formSubmit(model.parent, model);
			// set all form elements
			elements = useful.css.select(model.input, model.parent);
			for (a = 0 , b = elements.length; a < b; a += 1) {
				form.events.elementChange(elements[a], model);
			}
		},
		// events
		events : {
			// form submit handler
			formSubmit : function (element, model) {
				// when the element changes
				element.onsubmit = function () {
					// recheck the form
					return form.check(model.parent, model);
				};
			},
			// input change handler
			elementChange : function (element, model) {
				// when the element changes
				useful.events.add(element, 'change', function () {
					// recheck the form
					form.check(model.parent, model);
				});
			}
		},
		// find the parent form node
		find : function (node) {
			// find the parent form
			var parent = node;
			while (parent.nodeName !== 'FORM' && parent.nodeName !== 'BODY') {
				parent = parent.parentNode;
			}
			// if a form was not found
			if (parent.nodeName === 'BODY') {
				// find the next parent with an id
				parent = node;
				while (parent.getAttribute('id') === null && parent.nodeName !== 'BODY') {
					parent = parent.parentNode;
				}
			}
			// return the found node
			return parent;
		},
		// validates all required fields in a form and reports back
		check : function (parent, options) {
			// for all elements in this form
			var allValidate = true;
			var allFormElements = parent.getElementsByTagName('*');
			var allErrors = '';
			for (var a = 0; a < allFormElements.length; a += 1) {
				// if this is a form element with a required field
				if (
					allFormElements[a].nodeName.indexOf('#') < 0 &&
					allFormElements[a].getAttribute('required') !== null &&
					allFormElements[a].getAttribute('required') !== 'false'
				) {
					// validate it
					var thisValidates = form.validate(allFormElements[a], options);
					// store an error message
					allErrors += (thisValidates) ? '' : '<span class="notification">' + allFormElements[a].title + ' is a required field.</span>';
					// check if anything failed up until this point
					allValidate = (allValidate && thisValidates);
				}
			}
			// if an error panel was supplied
			if (options.failure !== null) {
				// get the element that belongs to the error
				var checkError = useful.css.select(options.output)[0];
				// if any field was rejected
				if (!allValidate) {
					// show the error message
					checkError.className = (checkError.className.match(/hide/)) ? checkError.className.replace('hide', 'show') : checkError.className + ' show';
					// fill the error with the error message
					checkError.innerHTML = options.failure.replace('{0}', allErrors);
				// else
				} else {
					// remove the error message
					checkError.className = (checkError.className.match(/show/)) ? checkError.className.replace('show', 'hide') : checkError.className + ' hide';
					// clear the error message
					checkError.innerHTML = '';
				}
			}
			// return the result
			return allValidate;
		},
		// validates a field using its "required" and "pattern" attributes
		validate : function (field) {
			// default result
			var checkMatch = true;
			// get the required status
			var checkRequired = field.getAttribute('required');
			// if this field was required and not undisplayed
			if (field.offsetWidth !== 0 && checkRequired !== null && checkRequired !== 'false') {
				// get the pattern
				var checkPattern = field.getAttribute('pattern');
				// if there was a pattern
				if (checkPattern !== null) {
					// match the pattern
					checkMatch = (field.value.match(new RegExp(checkPattern)) !== null);
				// else
				} else {
					// use the right check for the field type
					switch (field.type) {
					case 'checkbox' :
						// check if the field is checked
						checkMatch = field.checked;
						break;
					case 'radio' :
						// check if any of these fields is checked
						checkMatch = false;
						var peers = document.getElementsByName(field.name);
						for (var a = 0, b = peers.length; a < b; a += 1) {
							checkMatch = (peers[a].checked || checkMatch);
						}
						break;
					default :
						// check if the field is empty
						checkMatch = (field.value !== '' && field.value !== field.getAttribute('placeholder'));
					}
				}
				// if there was no match
				if (!checkMatch) {
					// mark the field with the error class
					field.parentNode.className += (field.parentNode.className.indexOf('error') < 0) ? ' error' : '';
				// else
				} else {
					// remove the error class
					field.parentNode.className = field.parentNode.className.replace(' error', '').replace('error', '');
				}
			}
			// return the result
			return checkMatch;
		},
		// update the form using AJAX and JSON
		update : function (node, event, options) {
			// find the parent form
			var form = form.find(node);
			// create a settings object
			var cfg = useful.storage.settings(node.name);
			// submit the form after a delay
			clearTimeout(cfg.timeout);
			cfg.timeout = setTimeout(function () {
				// submit the form
				form.submit(form, options);
			}, 500);
			// cancel the actual submit
			useful.events.cancel(event);
		},
		// submit the form using AJAX and JSON
		submit : function (node, event, options) {
			// find the parent form
			var form = form.find(node);
			// validate all the values
			var formValidates = form.check(form, options);
			// if the form is to be submitted using AJAX
			if (options.ajax) {
				// create a settings object
				var cfg = useful.storage.settings(node.name);
				// if the form validates
				if (formValidates) {
					// submit the form after a delay using AJAX
					clearTimeout(cfg.timeout);
					cfg.timeout = setTimeout(function () {
						// submit the form
						form.send(form, options);
					}, 500);
				}
				// cancel the actual submit
				useful.events.cancel(event);
			} else {
				// if the form doesn't validate
				if (!formValidates) {
					// cancel the submit
					useful.events.cancel(event);
				}
			}
		},
		// submits a form's query as an AJAX request - options = {url : string, method : "post/get"}
		send : function (form, options) {
			// gather the form values
			var submitUrl = form.values(form, options);
			var submitMethod = form.method;
			// if there are an overriding url
			if (options.url !== null) {
				// rewrite the url
				submitUrl = options.url + ((options.url.indexOf('?') < 0) ? '?' : '&') + submitUrl.split('?')[1];
			}
			// if there are an overriding method
			if (options.method !== null) {
				// rewrite the method
				submitMethod = options.method;
			}
			// submit the form
			useful.request.send({
				url : (submitMethod === 'post') ? submitUrl.split('?')[0] : submitUrl,
				post : (submitMethod === 'post') ? submitUrl.split('?')[1] : null,
				onProgress : function () {
					// disable the form
					form.className = form.className.split(' update_')[0] + ' form_busy';
				},
				onFailure : function (reply) { return reply; },
				onSuccess : function (reply) {
					// apply the rewrite information
					useful.updates.rewrite(reply.responseText);
					// (re)enable the form
					form.className = form.className.split(' update_')[0];
				}
			});
		},
		// generates the query string from the form's values
		values : function (form, options) {
			// if the options came with a url get this instead of the action from the form
			var url = (options !== null && options.url !== null) ? options.url : form.getAttribute('action');
			// add a token first parameter for consistency
			if (url.indexOf('?') < 0) {
				url += '?foo=bar';
			}
			// for all nodes in the form
			var inputs = form.getElementsByTagName('*');
			for (var a = 0, b = inputs.length; a < b; a += 1) {
				// if this is a form element
				if (inputs[a].nodeName === 'INPUT' || inputs[a].nodeName === 'SELECT' || inputs[a].nodeName === 'TEXTAREA') {
					// select the type of element
					switch (inputs[a].type) {
					case 'radio' :
						// if the element is checked
						if (inputs[a].checked) {
							// select the name/value pair
							url += '&' + inputs[a].name + '=' + inputs[a].value;
						}
						break;
					case 'checkbox' :
						// if the element is checked
						if (inputs[a].checked) {
							// select the name/value pair
							url += '&' + inputs[a].name + '=' + inputs[a].value;
						}
						break;
					case 'button' :
						break;
					case 'submit' :
						break;
					case 'reset' :
						break;
					default :
						// select the name/value pair
						url += '&' + inputs[a].name + '=' + inputs[a].value;
					}
				}
			}
			// return the query string
			return url;
		}
	};

	// public functions
	useful.form = {};
	useful.form.setup = form.setup;

	/*
		Placeholder text for input fields (input value method) - version 20121126

	// private functions
	var placeholder = {};
	placeholder = {
		init : function (node, settings) {
			// if this browser doesn't support HTML5 placeholders
			if (!settings.support) {
				// if this input element has a placeholder
				var attribute = node.getAttribute('placeholder');
				if (attribute) {
					// set the event handlers
					if (node.addEventListener) {
						node.addEventListener('focus', function (event) { placeholder.hide(node, event, settings); }, false);
					} else {
						node.attachEvent('onfocus', function (event) { placeholder.hide(node, event, settings); });
					}
					if (node.addEventListener) {
						node.addEventListener('blur', function (event) { placeholder.show(node, event, settings); }, false);
					} else {
						node.attachEvent('onblur', function (event) { placeholder.show(node, event, settings); });
					}
					// show the placeholder
					placeholder.show(node, null, settings);
				}
			}
		},
		show : function (node, event, settings) {
			// if the field is empty
			if (node.value === '') {
				// fill it with the placeholder
				node.value = node.getAttribute('placeholder');
				// add its color
				node.style.color = settings.color;
			}
		},
		hide : function (node) {
			// if the field is empty
			if (node.value === node.getAttribute('placeholder')) {
				// empty the placeholder
				node.value = '';
				// remove its color
				node.style.color = '';
			}
		}
	};

	// public functions
	useful.placeholder = {};
	useful.placeholder.init = placeholder.init;
	*/

	/*
		placeholders for input elements (DOM method)
	*/

	// private functions
	var placeholder = {};
	placeholder = {
		init : function (node, settings) {
			// if this browser doesn't support HTML5 placeholders
			if (!settings.support) {
				// if this input element has a placeholder
				var attribute = node.getAttribute('placeholder');
				if (attribute) {
					// build the placeholder
					placeholder.create(node, settings);
				}
			} else {
				// remove well intended hacks
				if (node.value === node.getAttribute('placeholder')) {
					node.value = '';
				}
			}
		},
		create : function (node, settings) {
			// create a placeholder for the placeholder
			var overlay = document.createElement('span');
			overlay.className = 'placeholder';
			overlay.innerHTML = node.getAttribute('placeholder');
			overlay.style.position = 'absolute';
			overlay.style.color = settings.color;
			overlay.style.visibility = 'hidden';
			overlay.style.left = settings.offsetX + 'px';
			overlay.style.top = settings.offsetY + 'px';
			overlay.style.zIndex = 10;
			node.parentNode.insertBefore(overlay, node);
			// set the event handlers
			/*
			if (node.addEventListener) {
				node.addEventListener('focus', function () { placeholder.hide(node, overlay, settings); }, false);
				node.addEventListener('blur', function () { placeholder.show(node, overlay, settings); }, false);
				overlay.addEventListener('mousedown', function () { placeholder.focus(node, overlay, settings); }, false);
			} else {
				node.attachEvent('onfocus', function () { placeholder.hide(node, overlay, settings); });
				node.attachEvent('onblur', function () { placeholder.show(node, overlay, settings); });
				overlay.attachEvent('onmousedown', function () { placeholder.focus(node, overlay, settings); });
			}
			*/
			// initial state
			placeholder.show(node, overlay, settings);
			setInterval(function () {
				placeholder.show(node, overlay, settings);
			}, 1000);
		},
		show : function (node, overlay) {
			// if the field is empty
			if (node.value === '') {
				// show the overlay
				overlay.style.visibility = 'visible';
			} else {
				// hide the overlay
				overlay.style.visibility = 'hidden';
			}
		},
		hide : function (node, overlay) {
			// hide the overlay
			overlay.style.visibility = 'hidden';
		},
		focus : function (node, overlay, settings) {
			// hide the placeholder
			placeholder.hide(node, overlay, settings);
			// focus the input element
			setTimeout(function () {
				node.focus();
			}, 100);
		}
	};

	// public functions
	useful.placeholder = {};
	useful.placeholder.init = placeholder.init;

	/*
		File uploader skin - version 20121126
	*/

	var file = {};
	file = {
		init : function (element) {
			var wrapper, removed, readout;
			// create the wrapper skin
			wrapper = document.createElement('div');
			wrapper.className = 'file button';
			element.parentNode.insertBefore(wrapper, element);
			// move the element into the wrapper
			removed = element.parentNode.removeChild(element);
			wrapper.appendChild(removed);
			// add the readout overlay
			readout = document.createElement('div');
			readout.className = 'file-readout';
			wrapper.appendChild(readout);
			// add update event handler
			element.onchange = function () {
				file.update(element, readout);
			};
			// update at least once
			file.update(element, readout);
		},
		update : function (element, readout) {
			readout.innerHTML = element.value;
		}
	};

	// public functions
	useful.file = {};
	useful.file.init = file.init;

	/*
		Colour input field - version 20121126
	*/

	// private functions
	var color = {};
	color = {
		// update cascade
		init : function (view, model) {
			// store the view
			model.parent = view;
			// if the browser doesn't support ranges or is compelled to override the native ones
			if (!model.support) {
				// build the interface
				color.setup(model);
				// start the updates
				color.update(model);
			}
		},
		setup : function (model) {
			// measure the dimensions of the parent element if they are not given
			model.width = model.width || model.parent.offsetWidth;
			model.height = model.height || model.parent.offsetHeight;
			// create a container around the element
			model.container = document.createElement('span');
			model.container.className = 'color';
			// add the container into the label
			model.parent.parentNode.insertBefore(model.container, model.parent);
			// move the input element into the container
			model.container.appendChild(model.parent.parentNode.removeChild(model.parent));
			// add the pick button
			model.button = document.createElement('span');
			model.button.className = 'color_button color_passive';
			model.container.appendChild(model.button);
			// set the event handlers
			color.events.pick(model.button, model);
			color.events.reset(document.body, model);
			color.events.change(model.parent, model);
		},
		update : function (model) {
			// update the colour indicator
			model.button.innerHTML = model.color;
			model.button.title = model.color;
			model.button.style.backgroundColor = model.color;
			model.parent.value = model.color;
			// update the sub-components
			color.popup.update(model);
		},
		events : {
			change : function (element, model) {
				// set an event handler
				useful.events.add(element, 'change', function () {
					var colour;
					// if this appears to be a valid hex string
					colour = parseInt(element.value.replace('#', ''), 16);
					if (!isNaN(colour) && element.value.match(/#/) && (element.value.length === 4 || element.value.length === 7)) {
						// try to change it into a colour
						model.color = element.value;
						// update the interface
						color.update(model);
					}
				});
			},
			pick : function (element, model) {
				// set an event handler
				element.onclick = function () {
					// construct the popup
					color.popup.setup(model);
					// cancel the click
					return false;
				};
			},
			reset : function (element, model) {
				useful.events.add(element, 'click', function () {
					// construct the popup
					color.popup.remove(model);
					// cancel the click
					return false;
				});
			}
		},
		popup : {
			setup : function (model) {
				var colour, colours, labelName, inputName, sliderName;
				// remove any existing popup
				if (model.popup) {
					model.popup.parentNode.removeChild(model.popup);
				}
				// reset its hover state
				model.hover = false;
				// build the popup container
				model.popup = document.createElement('div');
				model.popup.className = 'color_popup color_hidden';
				// build the colours UI
				model.colourInput = document.createElement('fieldset');
				// write the colour controls
				colours = {'red' : 'Red: ', 'green' : 'Green: ', 'blue' : 'Blue: '};
				for (colour in colours) {
					if (colours.hasOwnProperty(colour)) {
						labelName = colour + 'Label';
						inputName = colour + 'Input';
						sliderName = colour + 'Slider';
						model[labelName] = document.createElement('label');
						model[labelName].innerHTML = colours[colour];
						model[inputName] = document.createElement('input');
						model[inputName].setAttribute('type', 'number');
						model[inputName].setAttribute('name', inputName);
						model[inputName].setAttribute('min', '0');
						model[inputName].setAttribute('max', '255');
						model[inputName].setAttribute('step', '1');
						model[inputName].setAttribute('value', '127');
						model[sliderName] = document.createElement('input');
						model[sliderName].setAttribute('type', 'range');
						model[sliderName].setAttribute('class', 'range');
						model[sliderName].setAttribute('name', sliderName);
						model[sliderName].setAttribute('min', '0');
						model[sliderName].setAttribute('max', '255');
						model[sliderName].setAttribute('step', '1');
						model[sliderName].setAttribute('value', '127');
						model[labelName].appendChild(model[inputName]);
						model.colourInput.appendChild(model[labelName]);
						model.colourInput.appendChild(model[sliderName]);
					}
				}
				// add the colour input to the popup
				model.popup.appendChild(model.colourInput);
				// insert the popup into the document
				document.body.appendChild(model.popup);
				// position the popup
				model.position = useful.positions.object(model.button);
				model.limits = useful.positions.window();
				model.position.x -= (model.position.x + model.popup.offsetWidth > model.limits.x) ? model.popup.offsetWidth : 0;
				model.position.y -= (model.position.y + model.popup.offsetHeight > model.limits.y) ? model.popup.offsetHeight : 0;
				model.popup.style.left = (model.position.x + model.button.offsetWidth) + 'px';
				model.popup.style.top = (model.position.y + model.button.offsetHeight) + 'px';
				// update the popup once
				color.popup.update(model);
				// reveal the popup
				color.popup.reveal(model);
				// set the popup event handlers
				color.popup.events.popUpOver(model.popup, model);
				color.popup.events.popUpOut(model.popup, model);
				// invoke the event handlers and fall-back for the sliders
				for (colour in colours) {
					if (colours.hasOwnProperty(colour)) {
						inputName = colour + 'Input';
						sliderName = colour + 'Slider';
						color.popup.events.inputChange(model[inputName], colour, model);
						color.popup.events.sliderChange(model[sliderName], colour, model);
						useful.range.init(model[sliderName], {'title' : '{value} ({min}-{max})', 'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)});
					}
				}
			},
			update : function (model) {
				var red, green, blue;
				// if there is a popup
				if (model.popup) {
					// if this is a 6 digit colour
					if (model.color.length === 7) {
						// get the red component
						red = parseInt(model.color.substr(1, 2), 16);
						model.redInput.value = red;
						model.redSlider.value = red;
						// get the green component
						green = parseInt(model.color.substr(3, 2), 16);
						model.greenInput.value = green;
						model.greenSlider.value = green;
						// get the blue component
						blue = parseInt(model.color.substr(5, 2), 16);
						model.blueInput.value = blue;
						model.blueSlider.value = blue;
					// else
					} else if (model.color.length === 4) {
						// get the red component
						red = model.color.substr(1, 1);
						red = parseInt(red + red, 16);
						model.redInput.value = red;
						model.redSlider.value = red;
						// get the green component
						green = model.color.substr(2, 1);
						green = parseInt(green + green, 16);
						model.greenInput.value = green;
						model.greenSlider.value = green;
						// get the blue component
						blue = model.color.substr(3, 1);
						blue = parseInt(blue + blue, 16);
						model.blueInput.value = blue;
						model.blueSlider.value = blue;
					}
				}
			},
			convert : function (model) {
				var red, green, blue;
				// update the colour picker
				red = parseInt(model.redInput.value, 10).toString(16);
				red = (red.length === 1) ? '0' + red : red;
				green = parseInt(model.greenInput.value, 10).toString(16);
				green = (green.length === 1) ? '0' + green : green;
				blue = parseInt(model.blueInput.value, 10).toString(16);
				blue = (blue.length === 1) ? '0' + blue : blue;
				model.color = '#' + red + green + blue;
			},
			reveal : function (model) {
				// reveal the popup
				setTimeout(function () {
					model.popup.className = model.popup.className.replace('color_hidden', 'color_visible');
				}, 100);
			},
			remove : function (model) {
				// if the popup exists
				if (model.popup && !model.hover) {
					// hide the popup
					model.popup.className = model.popup.className.replace('color_visible', 'color_hidden');
				}
			},
			events : {
				inputChange : function (element, colour, model) {
					// set an event handler
					element.onchange = function () {
						var min, max, value;
						// process the value
						value = parseInt(element.value, 10);
						min = parseFloat(element.getAttribute('min'));
						max = parseFloat(element.getAttribute('max'));
						if (isNaN(value)) {
							value = 0;
						}
						if (value < min) {
							value = min;
						}
						if (value > max) {
							value = max;
						}
						// apply the value
						model[colour + 'Input'].value = value;
						model[colour + 'Slider'].value = value;
						// update the stored colour
						color.popup.convert(model);
						// update the interface
						color.update(model);
					};
				},
				sliderChange : function (element, colour, model) {
					// set an event handler
					element.onchange = function () {
						// process the value
						model[colour + 'Input'].value = parseInt(element.value, 10);
						// update the stored colour
						color.popup.convert(model);
						// update the interface
						color.update(model);
					};
				},
				popUpOver : function (element, model) {
					// set an event handler
					element.onmouseover = function () {
						// set the hover state
						model.hover = true;
					};
				},
				popUpOut : function (element, model) {
					// set an event handler
					element.onmouseout = function () {
						// reset the hover state
						model.hover = false;
					};
				}
			}
		}
	};

	// public functions
	useful.color = {};
	useful.color.init = color.init;

	/*
		Date input field - version 20121126
	*/

	// private functions
	var date = {};
	date = {
		// update cascade
		init : function (view, model) {
			// store the view
			model.parent = view;
			// if the browser doesn't support ranges or is compelled to override the native ones
			if (!model.support) {
				// build the interface
				date.setup(model);
				// start the updates
				date.update(model);
			}
		},
		setup : function (model) {
			// measure the dimensions of the parent element if they are not given
			model.width = model.width || model.parent.offsetWidth;
			model.height = model.height || model.parent.offsetHeight;
			// create a container around the element
			model.container = document.createElement('span');
			model.container.className = 'date';
			// add the container into the label
			model.parent.parentNode.insertBefore(model.container, model.parent);
			// move the input element into the container
			model.container.appendChild(model.parent.parentNode.removeChild(model.parent));
			// add the pick button
			model.button = document.createElement('span');
			model.button.innerHTML = '<span>' + new Date().getDate() + '</span>';
			model.button.className = 'date_button date_passive';
			model.container.appendChild(model.button);
			// set the event handlers
			date.events.reverse(model.parent, model);
			date.events.pick(model.button, model);
			date.events.reset(document.body, model);
		},
		update : function (model) {
			// if there is a valid date
			if (model.date) {
				// update the value
				model.parent.value = model.format
					.replace('d', model.date.getDate())
					.replace('m', model.date.getMonth() + 1)
					.replace('M', model.months[model.date.getMonth()])
					.replace('y', model.date.getFullYear());
			}
			// else use today
			else {
				model.date = new Date();
			}
		},
		events : {
			pick : function (element, model) {
				// set an event handler
				element.onclick = function () {
					// construct the popup
					date.popup.setup(model);
					// cancel the click
					return false;
				};
			},
			reset : function (element, model) {
				useful.events.add(element, 'click', function () {
					// construct the popup
					date.popup.remove(model);
					// cancel the click
					return false;
				});
			},
			reverse : function (element, model) {
				useful.events.add(element, 'keyup', function () {
					var inputValue, inputParts, inputDate;
					// preprocess problematic dates
					inputValue = element.value;
					switch (model.format) {
					case 'd/m/y':
						inputParts = inputValue.split('/');
						inputDate = (inputValue.length > 1) ? new Date(inputParts[2], inputParts[1] - 1, inputParts[0]) : new Date(inputValue);
						break;
					default :
						inputDate = new Date(inputValue);
					}
					// try to interpret and update the date
					if (!isNaN(inputDate)) {
						model.date = inputDate;
					}
				});
			}
		},
		popup : {
			setup : function (model) {
				// remove any existing popup
				if (model.popup) {
					model.popup.parentNode.removeChild(model.popup);
				}
				// reset its hover state
				model.hover = false;
				// build the popup container
				model.popup = document.createElement('div');
				model.popup.className = 'date_popup date_hidden';
				// build the title
				model.title = document.createElement('strong');
				model.title.innerHTML = '{title}';
				model.popup.appendChild(model.title);
				// build a space for the selectors
				model.selectors = document.createElement('div');
				model.selectors.className = 'date_selectors';
				model.popup.appendChild(model.selectors);
				// build the months selector
				date.popup.addMonthSelector(model);
				// build the years selector
				date.popup.addYearSelector(model);
				// build the previous month button
				model.previousMonth = document.createElement('button');
				model.previousMonth.className = 'button date_previous_month';
				model.previousMonth.innerHTML = '&lt;';
				model.popup.appendChild(model.previousMonth);
				date.popup.events.previousMonth(model.previousMonth, model);
				// build the next month button
				model.nextMonth = document.createElement('button');
				model.nextMonth.className = 'button date_next_month';
				model.nextMonth.innerHTML = '&gt;';
				model.popup.appendChild(model.nextMonth);
				date.popup.events.nextMonth(model.nextMonth, model);
				// build the previous year button
				model.previousYear = document.createElement('button');
				model.previousYear.innerHTML = '&lt;&lt;';
				model.previousYear.className = 'button date_previous_year';
				model.popup.appendChild(model.previousYear);
				date.popup.events.previousYear(model.previousYear, model);
				// build the next year button
				model.nextYear = document.createElement('button');
				model.nextYear.innerHTML = '&gt;&gt;';
				model.nextYear.className = 'button date_next_year';
				model.popup.appendChild(model.nextYear);
				date.popup.events.nextYear(model.nextYear, model);
				// build the today button
				model.today = document.createElement('button');
				model.today.innerHTML = 'Today';
				model.today.className = 'button date_today';
				model.popup.appendChild(model.today);
				date.popup.events.today(model.today, model);
				// build the clear button
				model.clear = document.createElement('button');
				model.clear.innerHTML = 'Clear';
				model.clear.className = 'button date_clear';
				model.popup.appendChild(model.clear);
				date.popup.events.clear(model.clear, model);
				// build the calendar
				date.popup.calendar.setup(model);
				// insert the popup into the document
				document.body.appendChild(model.popup);
				// position the popup
				model.position = useful.positions.object(model.button);
				model.limits = useful.positions.window();
				model.position.x -= (model.position.x + model.popup.offsetWidth > model.limits.x) ? model.popup.offsetWidth : 0;
				model.position.y -= (model.position.y + model.popup.offsetHeight > model.limits.y) ? model.popup.offsetHeight : 0;
				model.popup.style.left = model.position.x + 'px';
				model.popup.style.top = model.position.y + 'px';
				// update the popup once
				date.popup.update(model);
				// reveal the popup
				date.popup.reveal(model);
				// set the event handler
				date.popup.events.over(model.popup, model);
				date.popup.events.out(model.popup, model);
			},
			addMonthSelector : function (model) {
				var a, b, option;
				// create a selector
				model.monthPicker = document.createElement('select');
				model.monthPicker.setAttribute('name', 'pickmonth');
				// for every listed month
				for (a = 0 , b = model.months.length; a < b; a += 1) {
					// add and option to the selector for it
					option = document.createElement('option');
					option.innerHTML = model.months[a];
					option.value = a;
					model.monthPicker.appendChild(option);
				}
				// add the event handler
				date.popup.events.selectMonth(model.monthPicker, model);
				// add the selector to the popup
				model.selectors.appendChild(model.monthPicker);
			},
			addYearSelector : function (model) {
				var option, offset, year;
				// create a selector
				model.yearPicker = document.createElement('select');
				model.yearPicker.setAttribute('name', 'pickyear');
				// for the amount of years back
				offset = model.years[0];
				year = new Date().getFullYear();
				while (offset !== model.years[1]) {
					// add and option to the selector for it
					option = document.createElement('option');
					option.innerHTML = year + offset;
					option.value = year + offset;
					model.yearPicker.appendChild(option);
					// update the counter
					offset += (model.years[0] > model.years[1]) ? -1 : 1;
				}
				// add the event handler
				date.popup.events.selectYear(model.yearPicker, model);
				// add the selector to the popup
				model.selectors.appendChild(model.yearPicker);
			},
			update : function (model) {
				var a, b, referenceMonth, referenceYear, options;
				// figure out the values
				referenceMonth = model.reference.getMonth();
				referenceYear = model.reference.getFullYear();
				// update the title
				model.title.innerHTML = model.months[referenceMonth] + ' ' + referenceYear;
				// update the the year picker
				options = model.yearPicker.getElementsByTagName('option');
				for (a = 0 , b = options.length; a < b; a += 1) {
					options[a].selected = (parseInt(options[a].value, 10) === referenceYear);
				}
				// update the month picker
				options = model.monthPicker.getElementsByTagName('option');
				for (a = 0 , b = options.length; a < b; a += 1) {
					options[a].selected = (parseInt(options[a].value, 10) === referenceMonth);
				}
				// update the calendar
				date.popup.calendar.update(model);
			},
			doNotClose : function (model) {
				// prevent closing the popup
				model.hover = true;
				// revert after a while
				setTimeout(function () {
					model.hover = false;
				}, 100);
			},
			reveal : function (model) {
				// reveal the popup
				setTimeout(function () {
					model.popup.className = model.popup.className.replace('date_hidden', 'date_visible');
				}, 100);
			},
			remove : function (model) {
				// if the popup exists
				if (model.popup && !model.hover) {
					// hide the popup
					model.popup.className = model.popup.className.replace('date_visible', 'date_hidden');
				}
			},
			events : {
				clear : function (element, model) {
					// set an event handler
					element.onclick = function () {
						// reset everything
						model.date = null;
						model.parent.value = '';
						model.hover = false;
						date.popup.remove(model);
						date.update(model);
						// cancel the click
						return false;
					};
				},
				today : function (element, model) {
					// set an event handler
					element.onclick = function () {
						// set the date to today
						model.date = new Date();
						// update the component
						date.update(model);
						// close the popup
						model.hover = false;
						date.popup.remove(model);
						// cancel the click
						return false;
					};
				},
				nextMonth : function (element, model) {
					// set an event handler
					element.onclick = function () {
						// reduce the date by one year
						model.reference = new Date(model.reference.getFullYear(), model.reference.getMonth() + 1, model.reference.getDate());
						// redraw
						date.popup.update(model);
						// cancel the click
						return false;
					};
				},
				previousMonth : function (element, model) {
					// set an event handler
					element.onclick = function () {
						// reduce the date by one year
						model.reference = new Date(model.reference.getFullYear(), model.reference.getMonth() - 1, model.reference.getDate());
						// redraw
						date.popup.update(model);
						// cancel the click
						return false;
					};
				},
				selectMonth : function (element, model) {
					// set an event handler
					element.onchange = function () {
						// keep the popup visible
						date.popup.doNotClose(model);
						// reduce the date by one year
						model.reference = new Date(model.reference.getFullYear(), parseInt(element.value, 10), model.reference.getDate());
						// redraw
						date.popup.update(model);
					};
				},
				nextYear : function (element, model) {
					// set an event handler
					element.onclick = function () {
						// reduce the date by one year
						model.reference = new Date(model.reference.getFullYear() + 1, model.reference.getMonth(), model.reference.getDate());
						// redraw
						date.popup.update(model);
						// cancel the click
						return false;
					};
				},
				previousYear : function (element, model) {
					// set an event handler
					element.onclick = function () {
						// reduce the date by one year
						model.reference = new Date(model.reference.getFullYear() - 1, model.reference.getMonth(), model.reference.getDate());
						// redraw
						date.popup.update(model);
						// cancel the click
						return false;
					};
				},
				selectYear : function (element, model) {
					// set an event handler
					element.onchange = function () {
						// keep the popup visible
						date.popup.doNotClose(model);
						// reduce the date by one year
						model.reference = new Date(parseInt(element.value, 10), model.reference.getMonth(), model.reference.getDate());
						// redraw
						date.popup.update(model);
					};
				},
				over : function (element, model) {
					// set an event handler
					element.onmouseover = function () {
						// set the hover state
						model.hover = true;
					};
				},
				out : function (element, model) {
					// set an event handler
					element.onmouseout = function () {
						// reset the hover state
						model.hover = false;
					};
				}
			},
			calendar : {
				setup : function (model) {
					// set the browsed date to the same month as the selected date
					model.reference = new Date(model.date.getFullYear(), model.date.getMonth(), 1);
					// get the minimum and maximum dates
					model.minimum = new Date(model.parent.getAttribute('min'));
					if (isNaN(model.minimum)) {
						model.minimum = new Date(0);
					}
					model.maximum = new Date(model.parent.getAttribute('max'));
					if (isNaN(model.maximum) || model.maximum.getTime() === 0) {
						model.maximum = new Date(2200, 1, 1);
					}
					// build the calendar container
					model.calendar = document.createElement('div');
					model.calendar.className = 'date_calendar';
					model.popup.appendChild(model.calendar);
				},
				update : function (model) {
					var a, b, offset, month, reference, count, table, thead, tbody, row, col, link, span;
					// create a working reference
					reference = new Date(model.reference.getFullYear(), model.reference.getMonth(), 1);
					// create a table
					table = document.createElement('table');
					// create a table thead
					thead = document.createElement('thead');
					// add a row to the thead
					row = document.createElement('tr');
					// for all seven days
					for (a = 0 , b = 7; a < b; a += 1) {
						// create a cell
						col = document.createElement('th');
						col.innerHTML = model.days[a];
						// if this is the first day in the week
						if (a === 0) {
							// assign it a classname
							col.className = 'date_first';
						}
						// if this is the last day in the week
						else if (a === 6) {
							// assign it a classname
							col.className = 'date_last';
						}
						// add the cell to the row in the thead
						row.appendChild(col);
					}
					// add the row to the thead
					thead.appendChild(row);
					// add the thead to the table
					table.appendChild(thead);
					// create a table tbody
					tbody = document.createElement('tbody');
					// start a cell count
					count = 1;
					offset = 7 - reference.getDay() + 1;
					if (offset > 6) {
						offset = 0;
					}
					month = reference.getMonth();
					// while there are days in this month left
					while (month === reference.getMonth() && count < 32) {
						// create a row
						row = document.createElement('tr');
						// for all days in the week
						for (a = 0 , b = 7; a < b; a += 1) {
							// create a cell
							col = document.createElement('td');
							// if this cell has a date in this month (at an offset)
							if (count - offset === reference.getDate()) {
								// if this date is not before the minimum or after the maximum
								if (reference.getTime() > model.minimum.getTime() && reference.getTime() < model.maximum.getTime()) {
									// fill the cell with the date
									link = document.createElement('a');
									link.innerHTML = reference.getDate();
									link.href = '#' + reference.getDate() +
										'-' + (reference.getMonth() + 1) +
										'-' + reference.getFullYear();
									col.appendChild(link);
									// set its click handler
									date.popup.calendar.events.dateClick(link, new Date(
										reference.getFullYear(),
										reference.getMonth(),
										reference.getDate()
									), model);
								}
								// else
								else {
									// fill the cell with the date
									span = document.createElement('span');
									span.innerHTML = reference.getDate();
									col.appendChild(span);
								}
								// update the reference date
								reference = new Date(
									reference.getFullYear(),
									reference.getMonth(),
									reference.getDate() + 1
								);
							}
							// else
							else {
								// fill the cell with a blank
								col.innerHTML = '';
							}
							// if this is the first day in the week
							if (a === 0) {
								// assign it a classname
								col.className = 'date_first';
							}
							// if this is the last day in the week
							else if (a === 6) {
								// assign it a classname
								col.className = 'date_last';
							}
							// if this is the current day
							if (
								reference.getFullYear() === model.date.getFullYear() &&
								reference.getMonth() === model.date.getMonth() &&
								reference.getDate() === model.date.getDate() + 1
							) {
								// assign it a classname
								col.className += ' date_current';
							}
							// add the cell to the row
							row.appendChild(col);
							// update the counter
							count += 1;
						}
						// add the row to the tbody
						tbody.appendChild(row);
					}
					// add the tbody to the table
					table.appendChild(tbody);
					// clear the old content from the calendar
					model.calendar.innerHTML = '';
					// add the table to the calendar
					model.calendar.appendChild(table);
				},
				events : {
					dateClick : function (element, picked, model) {
						// set an event handler
						element.onclick = function () {
							// set the date from the picked cell
							model.date = picked;
							// update the component
							date.update(model);
							// close the popup
							model.hover = false;
							date.popup.remove(model);
							// cancel the click
							return false;
						};
					}
				}
			}
		}
	};

	// public functions
	useful.date = {};
	useful.date.init = date.init;

	/*
		Range input field - version 20121126
	*/

	// private functions
	var range = {};
	range = {
		// update cascade
		init : function (view, model) {
			// if the browser doesn't support ranges or is compelled to override the native ones and the element had not been treated before
			if (!model.support && !view.parentNode.className.match(/range/)) {
				// store the view
				model.parent = view;
				// build the interface
				range.setup(model);
				// start the updates
				range.update(model);
			}
		},
		setup : function (model) {
			// set the initial value, if there isn't one
			model.parent.value = model.parent.value || 0;
			// measure the dimensions of the parent element if they are not given
			model.width = model.width || model.parent.offsetWidth;
			model.height = model.height || model.parent.offsetHeight;
			// create a container around the element
			model.container = document.createElement('span');
			model.container.className = 'range';
			// add the container into the label
			model.parent.parentNode.insertBefore(model.container, model.parent);
			// move the input element into the container
			model.container.appendChild(model.parent.parentNode.removeChild(model.parent));
			// add the range rails
			model.rails = document.createElement('span');
			model.rails.className = 'range_rails';
			model.container.appendChild(model.rails);
			// add the range button
			model.button = document.createElement('span');
			model.button.className = 'range_button range_passive';
			model.container.appendChild(model.button);
			// set the event handler
			range.events.mouse(model.container, model);
			// check of changes
			clearInterval(model.interval);
			model.interval = setInterval(function () {
				range.update(model);
			}, 500);
		},
		update : function (model) {
			var min, max, value, steps, range;
			// get the attributes from the input element
			min = parseFloat(model.parent.getAttribute('min')) || 0;
			max = parseFloat(model.parent.getAttribute('max')) || 1;
			steps = parseFloat(model.parent.getAttribute('steps')) || 0;
			range = max - min;
			// get the offset of the element
			model.offset = useful.positions.object(model.container);
			// get the existing value or the fresh input
			value = (model.x === null) ?
				parseFloat(model.parent.value) :
				(model.x - model.offset.x) / model.container.offsetWidth * range + min;
			// apply any steps to the value
			if (steps) {
				var rounding;
				rounding = value % steps;
				value = (rounding > steps / 2) ?
					value + (steps - rounding) :
					value - rounding;
			}
			// normalize the value
			if (value < min) {
				value = min;
			}
			if (value > max) {
				value = max;
			}
			// set the button position
			model.button.style.left = Math.round((value - min) / range * 100) + '%';
			// update the title
			if (model.title) {
				model.container.setAttribute('title', model.title.replace('{value}', Math.round(value)).replace('{min}', min).replace('{max}', max));
			}
			// update the value
			model.parent.value = value;
			// trigger any onchange event
			if (model.x !== null) {
				useful.events.trigger(model.parent, 'change');
			}
		},
		events : {
			mouse : function (element, model) {
				// initialise coordinates
				model.x = null;
				model.reset = null;
				// mouse escapes the element
				element.onmouseout = function () {
					// cancel the previous reset timeout
					clearTimeout(model.reset);
					// set the reset timeout
					model.reset = setTimeout(function () {
						// cancel the interaction
						model.x = null;
						model.motion = false;
						// deactivate the button
						model.button.className = model.button.className.replace('_active', '_passive');
					}, 100);
				};
				element.onmouseover = function () {
					// cancel the previous reset timeout
					clearTimeout(model.reset);
				};
				// mouse gesture controls
				element.onmousedown = function (event) {
					// get the event properties
					event = event || window.event;
					// store the touch positions
					model.x = event.pageX || (event.x + model.offset.x);
					// activate the button
					model.button.className = model.button.className.replace('_passive', '_active');
					// update the value
					range.update(model);
					// cancel the click
					useful.events.cancel(event);
				};
				element.onmousemove = function (event) {
					// get the event properties
					event = event || window.event;
					// if the gesture is active
					if (model.x !== null) {
						// store the touch positions
						model.x = event.pageX || (event.x + model.offset.x);
						// update the value
						range.update(model);
					}
					// cancel the click
					useful.events.cancel(event);
				};
				element.onmouseup = function (event) {
					// get the event properties
					event = event || window.event;
					// reset the interaction
					model.x = null;
					// deactivate the button
					model.button.className = model.button.className.replace('_active', '_passive');
					// cancel the click
					useful.events.cancel(event);
				};
			}
		}
	};

	// public functions
	useful.range = {};
	useful.range.init = range.init;

	/*
		Useful Functions
	*/

	// public functions
	useful.events = useful.events || {};
	useful.events.add = function (element, eventName, eventHandler) {
		// exceptions
		eventName = (navigator.userAgent.match(/Firefox/i) && eventName.match(/mousewheel/i)) ? 'DOMMouseScroll' : eventName;
		// prefered method
		if ('addEventListener' in element) {
			element.addEventListener(eventName, eventHandler, false);
		}
		// alternative method
		else if ('attachEvent' in element) {
			element.attachEvent('on' + eventName, function (event) { eventHandler(event); });
		}
		// desperate method
		else {
			element['on' + eventName] = eventHandler;
		}
	};
	useful.events.trigger = function (element, eventName) {
		// exceptions
		if (typeof(events) !== 'undefined') {
			eventName = useful.events.name(eventName);
		}
		// prefered method
		if ('fireEvent' in element) {
			element.fireEvent('on' + eventName);
		}
		// alternative method
		else if ('dispatchEvent' in element) {
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent(eventName, false, true);
			element.dispatchEvent(evt);
		}
		// desperate method
		else {
			element['on' + eventName]();
		}
	};
	useful.events.cancel = function (event) {
		if (event) {
			if (event.preventDefault) { event.preventDefault(); }
			else if (event.preventManipulation) { event.preventManipulation(); }
			else { event.returnValue = false; }
		}
	};

	useful.models = useful.models || {};
	useful.models.clone = function (model) {
		var clonedModel, ClonedModel;
		// if the method exists
		if (typeof(Object.create) !== 'undefined') {
			clonedModel = Object.create(model);
		}
		// else use a fall back
		else {
			ClonedModel = function () {};
			ClonedModel.prototype = model;
			clonedModel = new ClonedModel();
		}
		// return the clone
		return clonedModel;
	};

	useful.css = useful.css || {};
	useful.css.select = function (input, parent) {
		var a, b, elements;
		// validate the input
		parent = parent || document;
		input = (typeof input === 'string') ? {'rule' : input, 'parent' : parent} : input;
		input.parent = input.parent || document;
		input.data = input.data || {};
		// use querySelectorAll to select elements, or defer to jQuery
		elements = (typeof(document.querySelectorAll) !== 'undefined') ?
			input.parent.querySelectorAll(input.rule) :
			(typeof(jQuery) !== 'undefined') ? jQuery(input.parent).find(input.rule).get() : [];
		// if there was a handler
		if (typeof(input.handler) !== 'undefined') {
			// for each element
			for (a = 0 , b = elements.length; a < b; a += 1) {
				// run the handler and pass a unique copy of the data (in case it's a model)
				input.handler(elements[a], useful.models.clone(input.data));
			}
		// else assume the function was called for a list of elements
		} else {
			// return the selected elements
			return elements;
		}
	};

	useful.positions = useful.positions || {};
	useful.positions.window = function () {
		// define a position object
		var dimensions = {x : 0, y : 0};
		// find the current dimensions of the window
		dimensions.x = window.innerWidth || document.body.offsetWidth;
		dimensions.y = window.innerHeight || document.body.offsetHeight;
		// return the object
		return dimensions;
	};
	useful.positions.object = function (node) {
		// define a position object
		var position = {x : 0, y : 0};
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
	};

}(window.useful = window.useful || {}));
