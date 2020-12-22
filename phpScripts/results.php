<html>
<head>
<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js'></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>

<link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-dialog/1.34.9/css/bootstrap-dialog.min.css" rel="stylesheet" type="text/css" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-dialog/1.34.9/js/bootstrap-dialog.min.js"></script>

</head>
<body>
<table class="table table-hover table-bordered table-striped">
<th>Timestamp</th><th>Message</th><th>ElID</th><th>TextContent</th><th>Url</th><th>Params</th>
<?php

ini_set('display_errors', 'On');

$servername = "localhost";
$username = "ssippl";
$password = "!l0g3?#";
$db = "ssippl";

// Create connection
$conn = new mysqli($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$stmt = $conn->prepare("SELECT timestamp, message, elID, textContent,  url, params FROM iclogs WHERE appID = ?");

$stmt->bind_param('s',$_GET['appID']);

$stmt->execute();

$stmt->bind_result($timestamp, $msg, $elID, $textContent,  $url, $params);

while ($row = $stmt->fetch()) {

	$escapedText = addslashes($textContent);
    echo "<tr><td>" . $timestamp . "</td><td>" . trim($msg) . "</td><td>" . $elID . "</td>";
    if($textContent)
        echo "<td><button class='btn' onclick='BootstrapDialog.alert(\"" . $escapedText . "\");' >Show Text</button></td>";
    else
        echo "<td></td>";
    if($url)
        echo"<td><a href='" . $url . "' target='_new' >" . $url . "</a></td>";
    else
         echo "<td></td>";

    echo"<td>" . $params ."</td></tr>";
}


$stmt->close();

mysqli_close($conn);

?>

</table>
</body>
</html>
