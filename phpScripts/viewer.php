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

$result = $conn->query("SELECT DISTINCT appID FROM iclogs");
?>

<form action='results.php' method='get'><select name='appID'>

<?php
if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        echo "<option>" . $row["appID"]. "</option>";
    }
}

?>


</select><input type='submit'></form>

<?php mysqli_close($conn); ?>
