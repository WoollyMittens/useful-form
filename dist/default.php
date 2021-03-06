<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<title>form.js: HTML5 Form Functionality</title>
		<style>
			html { font-family:Sans-Serif; font-size:75%; height:100%; }
			body { _height:100%; line-height:180%; margin:0; min-height:100%; padding:1%; }
			.example { max-width:960px; margin:0 auto; padding:0; clear:both; }
			.example > article, .example > aside { width:98%; padding:2%; }
			.example-left > article, .example-left > aside { width:48%; padding:1%; float:left; }
			.example-right > article, .example-right > aside { width:48%; padding:1%; float:right; }
			fieldset { border:none; }
		</style>
	</head>
	<body>
		<section class="example example-right">
			<article>
				<h2>HTML5 Form Functionality</h2>
				<p>A form using HTML5 form elements, that validates both client- and server-side and stores the entries in XML.</p>
				<p><a class="button downloadButton" href="http://github.com/WoollyMittens/useful-form" target="_blank">Download (GitHub)</a></p>
			</article>
			<aside>

				<!-- Cut below this -->
				<style>@import url("./css/form.css");</style>
				<?php include("./php/form.php"); ?>
				<script src="./lib/positions.js"></script>
				<script src="./lib/transitions.js"></script>
				<script src="./js/form.js"></script>
				<script>
				//<!--
					var form = new Form({
						'element' : document.getElementById('exampleform'),
						'input' : 'input, select, textarea',
						'output' : 'div.summary',
						'message' : '<div class="failure"><h3>Please correct the following problem(s):</h3>{0}</div>'
					});
				//-->
				</script>
				<!-- Cut above this -->

			</aside>
		</section>
	</body>
</html>
