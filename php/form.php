<?php
/*
	Source:
	van Creij, Maurice (2012). "form.php: A simple contact form", version 20120606, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

	/* storage place for all validation data */
	$validationResults = array();
	$submitted = false;

	/* stores the regular expressions that go with form elements on page render */
	function storeValidation($name, $pattern, $required, $type, $default, $class, $title){
		// globals
		global $validationResults;
		global $submitted;
		// default value for the patterns
		if($pattern=='') $pattern = '^.+$';
		// check if the form was submitted
		$submitted = @$_REQUEST['form_submitted'];
		if(!isset($submitted)) $submitted = @$_POST['form_submitted'];
		// get the field's value from the submitted data
		$value = @$_REQUEST[$name];
		if(!isset($value)) $value = @$_POST[$name];
		// if the form was submitted at all
		$passes = true;
		if($submitted){
			// check if required fields were left empty
			if($required) $passes = false;
			// check if the value matches the pattern
			if($value) $passes = preg_match('/' . $pattern . '/', $value);
		}
		// store the validation properties
		$validationResult = array($name, $pattern, $required, $passes, $value);
		$validationResults[$name] = $validationResult;
		// decide if the error is to be shown
		$error = ($passes) ? 'class="type_' . $type . ' ' . $class . '" ' : 'class="type_' . $type . ' ' . $class . ' error" ' ;
		// display the name of the element
		$name = 'name="' . $name . '" ';
		// decide to mark the field as required
		$required = ($required) ? 'required="required" ' : '' ;
		// return the input to the field
		$input = ($value!='') ? 'value="' . $value . '" ' : $input = 'value="' . $default . '" ' ;
		// format the pattern for use as an atribute
		$pattern = 'pattern="' . $pattern . '" ';
		// format the type of element
		$kind = 'type="' . $type . '" ';
		// add the given title
		$title = 'title="' . $title . '" ';
		// format the checked status
		$checked = '';
		// exceptions for certain elements
		if($type=='radio'){
			$checked = ($value == $default) ? 'checked="checked" ' : '' ;
			$pattern = '';
			$input = 'value="' . $default . '" ' ;
		}
		if($type=='checkbox'){
			$checked = ($value) ? 'checked="checked" ' : '' ;
			$pattern = '';
		}
		if($type=='select'){
			$input = '';
			$pattern = '';
			$kind = '';
		}
		if($type=='textarea'){
			$input = '';
			$pattern = '';
			$kind = '';
		}
		// complete writing the input field
		echo $name . $pattern . $error . $required . $checked . $kind . $title . $input;
	}

	/* restores the value that was entered before */
	function restoreValue($name){
		// globals
		global $validationResults;
		// write out the stored value
		echo $validationResults[$name][4];
	}

	/* restores the selected index of a select element */
	function restoreSelected($name, $value){
		// globals
		global $validationResults;
		// check if this was the selected value
		$selected = ($validationResults[$name][4]==$value) ? ' selected=selected' : '';
		// write out the stored value
		echo 'value=' . $value . $selected;
	}

	/* reports the validation message if the check didn't pass */
	function reportValidation($name, $message){
		// globals
		global $validationResults;
		// store the validation message
		$validationResults[$name][5] = $message;
		// show the error message if the entry didn't pass validation
		if($validationResults[$name][0] == $name && !$validationResults[$name][3]){
			echo $message;
		}
	}

	/* reports a summary of all validation messages */
	function summariseValidation($success, $failure, $suffix){
		// globals
		global $validationResults;
		global $submitted;
		// if the form was submitted at all
		if($submitted){
			// go through the results to find entries that failed
			$results = '';
			foreach ($validationResults as $validationResult){
				if(!$validationResult[3]) $results = $results . $validationResult[5];
			}
			// decide if this is to be a success or a failure
			if(strlen($results)>0){
				// write the error log summary
				echo $failure . $results . $suffix;
			}else{
				// write a confirmation message
				echo $success . $suffix;
				// write the results to a database
				storeResults();
			}
		}
	}

	/* stores the submitted data into a database */
	function storeResults(){
		/* globals */
		global $validationResults;
		// open the database file
		$xmlDoc = new DOMDocument();
		$xmlDoc->load('./xml/form.xml');
		// create a new record
		$newEntry = $xmlDoc->createElement('entry');
		// go through the results
		foreach ($validationResults as $validationResult){
			// store each name value pair
			$newName = $xmlDoc->createElement($validationResult[0]);
			$newValue = $xmlDoc->createTextNode($validationResult[4]);
			$newName->appendChild($newValue);
			$newEntry->appendChild($newName);
		}
		// append the new record to the file
		$xmlDoc->getElementsByTagName('root')->item(0)->appendChild($newEntry);
		// save and close the database file
		$xmlDoc->save('./xml/form.xml');
		$xmlDocSave = $xmlDoc->saveXML();
	}

?>

<form action="" id="test" method="get" novalidate>
	<input type="hidden" name="form_submitted" value="true"/>
	<input type="hidden" name="url" value="<?php echo @$_REQUEST['url']?>"/>
	<fieldset>
		<legend>Example Form</legend>
		<fieldset>
			<legend>
				<label for="form_title_m">Radio Options<em>*</em>:</label>
			</legend>
			<label>
				<input <?php storeValidation(
					$name='form_myradio',
					$pattern='',
					$required='required',
					$type='radio',
					$default='a',
					$class='',
					$title='My Radio'
				)?>/>
				Mr.
			</label>
			<label>
				<input <?php storeValidation(
					$name='form_myradio',
					$pattern='',
					$required='required',
					$type='radio',
					$default='b',
					$class='',
					$title='My Radio'
				)?>/>
				Ms.
			</label>
			<?php reportValidation(
				$name='form_myradio',
				$message='<span class="notification">No radio was chosen.</span>'
			)?>
		</fieldset>
		<label>
			Text Input<em>*</em>:
			<input <?php storeValidation(
				$name='form_mytext',
				$pattern='^.+$',
				$required='required',
				$type='text',
				$default='',
				$class='',
				$title='My Text'
			)?>/>
			<?php reportValidation(
				$name='form_mytext',
				$message='<span class="notification">No text entered.</span>'
			)?>
		</label>
		<label>
			Select List<em>*</em>:
			<select <?php storeValidation(
				$name='form_myselect',
				$pattern='^(\w(\s)?)+$',
				$required='required',
				$type='select',
				$default='',
				$class='',
				$title='My selection'
			)?>>
				<option value="">-</option>
				<option <?php restoreSelected(
					$name='form_myselect',
					$value='A'
				)?>>Option A</option>
				<option <?php restoreSelected(
					$name='form_myselect',
					$value='B'
				)?>>Option B</option>
			</select>
			<?php reportValidation(
				$name='form_myselect',
				$message='<span class="notification">No option was chosen.</span>'
			)?>
		</label>
		<fieldset class="line">
			<legend>
				<label for="form_myprefix">Multi Field Inputs<em>*</em>:</label>
			</legend>
			<label>
				Prefix:
				<select <?php storeValidation(
					$name='form_myprefix',
					$pattern='^.+$',
					$required='required',
					$type='select',
					$default='',
					$class='small',
					$title='My Prefix'
				)?>>
					<option value="">-</option>
					<option <?php restoreSelected(
						$name='form_myprefix',
						$value='01'
					)?>>1</option>
					<option <?php restoreSelected(
						$name='form_myprefix',
						$value='02'
					)?>>2</option>
				</select>
			</label>
			<label>
				Number:
				<input <?php storeValidation(
					$name='form_mynumber',
					$pattern='^\d+$',
					$required='required',
					$type='number',
					$default='',
					$class='text large',
					$title='My Number'
				)?> placeholder="number"/>
			</label>
			<?php reportValidation(
				$name='form_myprefix',
				$message='<span class="notification">No prefix was selected.</span>'
			)?>
			<?php reportValidation(
				$name='form_mynumber',
				$message='<span class="notification">No number was entered.</span>'
			)?>
		</fieldset>
		<label>
			Email<em>*</em>:
			<input <?php storeValidation(
				$name='form_myemail',
				$pattern='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$',
				$required='required',
				$type='email',
				$default='',
				$class='',
				$title='My Email'
			)?> placeholder="name@domain.com"/>
			<?php reportValidation(
				$name='form_myemail',
				$message='<span class="notification">No email was entered.</span>'
			)?>
		</label>
		<label>
			File<em>*</em>:
			<input <?php storeValidation(
				$name='form_myfile',
				$pattern='^.+$',
				$required='',
				$type='file',
				$default='',
				$class='file',
				$title='My File'
			)?>/>
			<?php reportValidation(
				$name='form_myfile',
				$message='<span class="notification">No file was selected.</span>'
			)?>
		</label>
	</fieldset>
	<fieldset>
		<legend>HTML5 Form Elements</legend>
		<label>
			Range - <span id="form_myrange_output">0</span>:
			<input <?php storeValidation(
				$name='form_myrange',
				$pattern='^.+$',
				$required='',
				$type='range',
				$default='',
				$class='range',
				$title='My Range'
			)?> min="0" max="100"/>
			<?php reportValidation(
				$name='form_myrange',
				$message='<span class="notification">No range selected.</span>'
			)?>
		</label>
		<script>
			// example event handler
			updateValue = function (event, element) {element = element || this; element.value = element.value || 0; document.getElementById('form_myrange_output').innerHTML = parseInt(element.value);}
			updateValue(null, document.getElementsByName('form_myrange')[0]);
			document.getElementsByName('form_myrange')[0].onchange = updateValue;
		</script>
		<label>
			Date:
			<input <?php storeValidation(
				$name='form_mydate',
				$pattern='^.+$',
				$required='',
				$type='date',
				$default='',
				$class='date',
				$title='My Date'
			)?> placeholder="day/month/year"/>
			<?php reportValidation(
				$name='form_mydate',
				$message='<span class="notification">No date entered.</span>'
			)?>
		</label>
		<label>
			Colour:
			<input <?php storeValidation(
				$name='form_mycolour',
				$pattern='^.+$',
				$required='',
				$type='color',
				$default='',
				$class='color',
				$title='My Colour'
			)?> placeholder="#FFFFFF"/>
			<?php reportValidation(
				$name='form_mycolour',
				$message='<span class="notification">No colour entered.</span>'
			)?>
		</label>
	</fieldset>
	<fieldset>
		<legend>Your Comments</legend>
		<label>
			Message:
			<textarea <?php storeValidation(
				$name='form_comments',
				$pattern='',
				$required='',
				$type='textarea',
				$default='',
				$class='',
				$title='Message'
			)?>><?php restoreValue(
				$name='form_comments'
			)?></textarea>
			<?php reportValidation(
				$name='form_comments',
				$message='<span class="notification">No comments were entered.</span>'
			)?>
		</label>
		<fieldset class="list">
			<legend>
				<label for="form_option_a">Options:</label>
			</legend>
			<label>
				<input <?php storeValidation(
					$name='form_updates',
					$pattern='',
					$required='',
					$type='checkbox',
					$default='1',
					$class='',
					$title='Options'
				)?>/>
				Sign me up for updates
			</label>
			<?php reportValidation(
				$name='form_updates',
				$message='<span class="notification">You have not signed up for updates.</span>'
			)?>
			<label>
				<input <?php storeValidation(
					$name='form_agree',
					$pattern='^.+$',
					$required='required',
					$type='checkbox',
					$default='1',
					$class='',
					$title='Agreement'
				)?>/>
				I agree with the <a href="#">terms and conditions</a><em>*</em>
			</label>
			<?php reportValidation(
				$name='form_agree',
				$message='<span class="notification">You have not agreed to the terms and conditions.</span>'
			)?>
		</fieldset>
	</fieldset>
	<div class="summary">
		<?php summariseValidation(
			$success='<div class="success"><h3>The form has been received successfully.</h3>',
			$failure='<div class="failure"><h3>Please correct the following problem(s):</h3>',
			$suffix='</div>'
		)?>
	</div>
	<div class="footer">
		<button class="button" type="submit" name="form_submit">Submit</button>
		<em>* Indicates a required field</em>
	</div>
</form>
