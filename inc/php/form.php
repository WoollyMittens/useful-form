<?php
/*
	Source:
	van Creij, Maurice (2014). "form.php: A simple contact form", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

	/* storage place for all validation data */
	$validationResults = array();
	$submitted = false;

	/* stores the regular expressions that go with form elements on page render */
	function storeValidation($tag, $name, $pattern, $required, $type, $default, $class, $title, $placeholder, $min, $max, $options, $labels, $message, $custom){
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
		$validationResult = array($name, $pattern, $required, $passes, $value, $message);
		$validationResults[$name] = $validationResult;
		// decide if the error is to be shown
		$error = ($passes) ? 'class="type_' . $type . ' ' . $class . '" ' : 'class="type_' . $type . ' ' . $class . ' error" ' ;
		// display the name of the element
		$name = 'name="' . $name . '" ';
		// decide to mark the field as required
		$required = ($required) ? 'required ' : '' ;
		// return the input to the field
		$input = ($value!='') ? 'value="' . $value . '" ' : $input = 'value="' . $default . '" ' ;
		// format the pattern for use as an atribute
		$pattern = 'pattern="' . $pattern . '" ';
		// format the type of element
		$kind = 'type="' . $type . '" ';
		// add the given title
		$title = 'title="' . $title . '" ';
		// add the minimum value
		$min = ($min!='') ? 'min="' . $min . '" ' : '';
		// add the maximum value
		$max = ($max!='') ? 'max="' . $max . '" ' : '';
		// add the maximum value
		$message = ($message!='') ? 'data-message="' . $message . '" ' : '';
		// add the placeholder text
		$placeholder = ($placeholder!='') ? 'placeholder="' . $placeholder . '" ' : '';
		// format the checked status
		$checked = '';
		// content for wrapping tags
		$opener = '<' . $tag . ' ';
		$closer = '/>';
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
			$options = restoreOptions($name, $options, $labels);
			$closer = '>' . $options . '</select>';
		}
		if($type=='textarea'){
			$input = '';
			$pattern = '';
			$kind = '';
			$closer = '>' . $value . '</textarea>';
		}
		// complete writing the input field
		return $opener . $name . $pattern . $error . $required . $checked . $kind . $placeholder . $min . $max . $message . $custom . $title . $input . $wrapped . $closer;
	}

	/* restores the value that was entered before */
	function restoreValue($name){
		// globals
		global $validationResults;
		// write out the stored value
		return $validationResults[$name][4];
	}

	/* restores the selected index of a select element */
	function restoreOptions($name, $options, $labels){
		// globals
		global $validationResults;
		// split the input
		$options = explode(',', $options);
		$labels = explode(',', $labels);
		// for ever option
		$optionTags = '';
		for ($a = 0; $a < count($options); $a++) {
			// check if this was the selected value
			$selected = ($validationResults[$name][4]==$options[$a]) ? ' selected="selected"' : '';
			$optionTags = $optionTags . '<option value="' . $options[$a] . '"' . $selected . '>' . $labels[$a] . '</option>';
		}
		// write out the stored value
		return $optionTags;
	}

	/* reports the validation message if the check didn't pass */
	function reportValidation($name){
		// globals
		global $validationResults;
		// show the error message if the entry didn't pass validation
		if($validationResults[$name][0] == $name && !$validationResults[$name][3]){
			return '<span class="notification">' . $validationResults[$name][5] . '</span>';
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
				if(!$validationResult[3]) $results = $results . reportValidation($validationResult[0]);
			}
			// decide if this is to be a success or a failure
			if(strlen($results)>0){
				// write the error log summary
				return $failure . $results . $suffix;
			}else{
				// write a confirmation message
				return $success . $suffix;
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

<form action="" id="exampleform" method="get" novalidate>
	<input type="hidden" name="form_submitted" value="true"/>
	<input type="hidden" name="url" value="<?php echo @$_REQUEST['url']?>"/>
	<fieldset>
		<legend>Example Form</legend>
		<fieldset>
			<legend>
				<label for="form_title_m">Radio Options<em>*</em>:</label>
			</legend>
			<label>
				<?php echo storeValidation(
					$tag='input',
					$name='form_myradio',
					$pattern='',
					$required='required',
					$type='radio',
					$default='a',
					$class='',
					$title='My Radio',
					$placeholder='',
					$min='',
					$max='',
					$options='',
					$labels='',
					$message='No radio was chosen.',
					$custom=''
				)?>
				Mr.
			</label>
			<label>
				<?php echo storeValidation(
					$tag='input',
					$name='form_myradio',
					$pattern='',
					$required='required',
					$type='radio',
					$default='b',
					$class='',
					$title='My Radio',
					$placeholder='',
					$min='',
					$max='',
					$options='',
					$labels='',
					$message='No radio was chosen.',
					$custom=''
				)?>
				Ms.
			</label>
			<?php echo reportValidation($name='form_myradio')?>
		</fieldset>
		<label>
			Text Input<em>*</em>:
			<?php echo storeValidation(
				$tag='input',
				$name='form_mytext',
				$pattern='^.+$',
				$required='required',
				$type='text',
				$default='',
				$class='',
				$title='My Text',
				$placeholder='',
				$min='',
				$max='',
				$options='',
				$labels='',
				$message='No text entered.',
				$custom=''
			)?>
			<?php echo reportValidation($name='form_mytext')?>
		</label>
		<label>
			Select List<em>*</em>:
			<?php echo storeValidation(
				$tag='select',
				$name='form_myselect',
				$pattern='^(\w(\s)?)+$',
				$required='required',
				$type='select',
				$default='',
				$class='',
				$title='My selection',
				$placeholder='',
				$min='',
				$max='',
				$options=',A,B',
				$labels='-,Option A,Option B',
				$message='No option was chosen.',
				$custom=''
			)?>
			<?php echo reportValidation($name='form_myselect')?>
		</label>
		<fieldset class="line">
			<legend>
				<label for="form_myprefix">Multi Field Inputs<em>*</em>:</label>
			</legend>
			<label>
				Prefix:
				<?php echo storeValidation(
					$tag='select',
					$name='form_myprefix',
					$pattern='^.+$',
					$required='required',
					$type='select',
					$default='',
					$class='small',
					$title='My Prefix',
					$placeholder='',
					$min='',
					$max='',
					$options=',A,B',
					$labels='-,Option A,Option B',
					$message='No prefix was selected.',
					$custom=''
				)?>
			</label>
			<label>
				Number:
				<?php echo storeValidation(
					$tag='input',
					$name='form_mynumber',
					$pattern='^\d+$',
					$required='required',
					$type='number',
					$default='',
					$class='text large',
					$title='My Number',
					$placeholder='number',
					$min='',
					$max='',
					$options='',
					$labels='',
					$message='No number was entered.',
					$custom=''
				)?>
			</label>
			<?php echo reportValidation($name='form_myprefix')?>
			<?php echo reportValidation($name='form_mynumber')?>
		</fieldset>
		<label>
			Email<em>*</em>:
			<?php echo storeValidation(
				$tag='input',
				$name='form_myemail',
				$pattern='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$',
				$required='required',
				$type='email',
				$default='',
				$class='',
				$title='My Email',
				$placeholder='name@domain.com',
				$min='',
				$max='',
				$options='',
				$labels='',
				$message='No email was entered.',
				$custom=''
			)?>
			<?php echo reportValidation($name='form_myemail')?>
		</label>
		<label>
			File<em>*</em>:
			<?php echo storeValidation(
				$tag='input',
				$name='form_myfile',
				$pattern='^.+$',
				$required='',
				$type='file',
				$default='',
				$class='file',
				$title='My File',
				$placeholder='',
				$min='',
				$max='',
				$options='',
				$labels='',
				$message='No file was selected.',
				$custom=''
			)?>
			<?php echo reportValidation($name='form_myfile')?>
		</label>
	</fieldset>
	<fieldset>
		<legend>Your Comments</legend>
		<label>
			Message:
			<?php echo storeValidation(
				$tag='textarea',
				$name='form_comments',
				$pattern='',
				$required='',
				$type='textarea',
				$default='',
				$class='',
				$title='Message',
				$placeholder='',
				$min='',
				$max='',
				$options='',
				$labels='',
				$message='No comments were entered.',
				$custom=''
			)?>
			<?php echo reportValidation($name='form_comments')?>
		</label>
		<fieldset class="list">
			<legend>
				<label for="form_option_a">Options:</label>
			</legend>
			<label>
				<?php echo storeValidation(
					$tag='input',
					$name='form_updates',
					$pattern='',
					$required='',
					$type='checkbox',
					$default='1',
					$class='',
					$title='Options',
					$placeholder='',
					$min='',
					$max='',
					$options='',
					$labels='',
					$message='You have not signed up for updates.',
					$custom=''
				)?>
				Sign me up for updates
			</label>
			<?php echo reportValidation($name='form_updates')?>
			<label>
				<?php echo storeValidation(
					$tag='input',
					$name='form_agree',
					$pattern='^.+$',
					$required='required',
					$type='checkbox',
					$default='1',
					$class='',
					$title='Agreement',
					$placeholder='',
					$min='',
					$max='',
					$options='',
					$labels='',
					$message='You have not agreed to the terms and conditions.',
					$custom=''
				)?>
				I agree with the <a href="#">terms and conditions</a><em>*</em>
			</label>
			<?php echo reportValidation($name='form_agree')?>
		</fieldset>
	</fieldset>
	<div class="summary">
		<?php echo summariseValidation(
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
