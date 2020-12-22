<?php

ini_set('display_errors', 'On');

$servername = "localhost";
$username = "ssippl";
$password = "!l0g3?#";
$db = "ssippl";


//Table creation "script": create table iclogs(entryID bigint PRIMARY KEY auto_increment, appID varchar(255), timestamp timestamp, message varchar(255), elID varchar(255), textContent mediumtext, url varchar(255), params text)

// Create connection
$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$fields = json_decode($_POST['message']);


$stmt = $conn->prepare("INSERT INTO iclogs (appID, timestamp ,message, elID, textContent, url, params) VALUES(?,?,?,?,?,?,?);");
$stmt->bind_param('sssssss', $_POST['sessionid'], date('Y-m-d H:i:s', $_POST['timestamp']/1000), $fields->{'msg'},$fields->{'id'}, $fields->{'textContent'}, $fields->{'url'}, $fields->{'param'});

$stmt->execute();
$stmt->close();


mysqli_close($conn);

?>


