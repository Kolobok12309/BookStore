<?php
	function op_db() {
		return new SQLite3($_SERVER['DOCUMENT_ROOT'].'/sys/books.db');
	}

	function getBooks() {
		$db = op_db();
		$books = $db->query('SELECT * FROM books ORDER BY id');
		while ($row = $books->fetchArray()) {
			$arr[] = $row;
		}
		$db->close();
		echo json_encode($arr);
	}

	function doOrder() {
		$objects = SQLite3::escapeString($_POST['objects']);
		$holder = SQLite3::escapeString($_POST['holder']);
		$arr = json_decode($objects);
		$db = op_db();
		$sum = 0;
		foreach($arr as $obj) {
			$id=$obj->id;
			$cost = $db->querySingle("SELECT `cost` FROM `books` WHERE `id`=$id");
			$sum+=$cost*$obj->count;
		}
		$date = date('c');
		try {
			$db->exec("INSERT INTO `orders` VALUES (NULL, '$objects', '$holder','$date',$sum)");
			$id = $db->querySingle("SELECT seq FROM sqlite_sequence WHERE name='orders'");
			echo json_encode(["status" => "ok","id" => $id]);
		} catch(Exception $err) {
			echo json_encode(["status" => "err","msg" => "Ошибка при записи в базу данных"]);
		}
		$db->close();
	}

	switch($_POST['action']) {
		case 'getBooks':
			getBooks();
			break;
		case 'doOrder':
			doOrder();
			break;
		default:
			echo 'FAIL';
			break;
	}
?>