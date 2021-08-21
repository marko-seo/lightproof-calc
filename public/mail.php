<?php 

$mail = "blagojevic.m@seointellect.ru";

if (!empty($_POST)) {
	
	$message = '';

	foreach($_POST as $key => $itemForm) {
		$message .= ($key . ': ' . $itemForm . ';\n');
   	}

	if (mail($mail, 'test', $message)) {
		echo $message;
	} else {
		echo false;
	}

}
