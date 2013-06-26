<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<title>useful.form.js: HTML5 Form Functionality</title>
		<style>
			html { font-family:Sans-Serif; font-size:75%; height:100%; }
			body { _height:100%; line-height:180%; margin:0; min-height:100%; padding:0; }
			.padded { padding:2em; }
		</style>
		<!--[if IE]>
			<meta http-equiv="imagetoolbar" content="no"/>
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<script src="./js/html5.js"></script>
			<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
		<![endif]-->
	</head>
	<body>
		<section class="example rightExample clearfix">
			<article class="example">
				<h2>HTML5 Form Functionality</h2>
				<p>A form using HTML5 form elements, that validates both client- and server-side and stores the entries in XML.</p>
				<p><a class="button downloadButton" href="http://www.woollymittens.nl/downloads/form.zip" target="_blank">Download</a></p>
			</article>
			<aside class="example">

				<!-- Cut below this -->
				<style>@import url("./css/form.css")</style>
				<?php include("./php/form.php"); ?>
				<script src="./js/useful.form.js"></script>
				<script>
				//<!--

					/*
						Form validation
					*/

					useful.css.select({
						rule : 'form',
						handler : useful.form.setup,
						data : {
							// input and output elements
							'input' : 'input, select, textarea',
							'output' : 'div.summary',
							// report strings
							'failure' : '<div class="failure"><h3>Please correct the following problem(s):</h3>{0}</div>',
							'success' : '<div class="success"><h3>The form has been received successfully.</h3>{0}</div>',
							// ajax functionality
							'ajax' : false,
							'url' : null,
							'method' : null
						}
					});

					/*
						Placeholder text
					*/

					useful.css.select({
						rule : 'input, textarea',
						handler : useful.placeholder.init,
						data : {
							// placeholder color
							'color' : '#999',
							// browsers that are assumed to have native support for <input placeholder='Foo bar'/>
							'support' : navigator.userAgent.match(/webkit|firefox|opera|msie 10/gi),
							// position tweak
							'offsetX' : 10,
							'offsetY' : 30
						}
					});

					/*
						Colour picker
					*/

					useful.css.select({
						rule : 'input.color',
						handler : useful.color.init,
						data : {
							// initial color
							'color' : '#FF0000',
							// browsers that are assumed to have native support for <input type='range'/>
							'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
						}
					});

					/*
						Date picker
					*/

					useful.css.select({
						rule : 'input.date',
						handler : useful.date.init,
						data : {
							// names
							'years' : [20, -120],
							'months' : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
							'days' : ['s', 'm', 't', 'w', 't', 'f', 's'],
							// format of the output date options: d, m, M, y
							'format' : 'd/m/y',
							// browsers that are assumed to have native support for <input type='range'/>
							'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
						}
					});

					/*
						Range slider
					*/

					useful.css.select({
						rule : 'input.range',
						handler : useful.range.init,
						data : {
							// information tooltip
							'title' : '{value}% ({min}-{max})',
							// browsers that are assumed to have native support for <input type='range'/>
							'support' : navigator.userAgent.match(/webkit|opera|msie 10/gi)
						}
					});

					/*
						File selector
					*/

					useful.css.select({
						rule : 'input.type_file',
						handler : useful.file.init,
						data : {
							'foo' : 'bar'
						}
					});

				//-->
				</script>
				<!-- Cut above this -->

			</aside>
		</section>
	</body>
</html>
