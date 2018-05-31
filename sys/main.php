<?php
	function op_db() {//Функция чтобы легко открывать базу данных sqlite3
		return new SQLite3($_SERVER['DOCUMENT_ROOT'].'/sys/books.db');
	}

	function getBooks() {//функция которая отдаст книги содержащиеся в базе данных в формате JSON
		$db = op_db();
		$books = $db->query('SELECT * FROM books ORDER BY id');//запрос в бд
		while ($row = $books->fetchArray()) {//заполнение массива данными из бд
			$arr[] = $row;
		}
		$db->close();//закрытие бд
		echo json_encode($arr);//ответ
	}

	function doOrder() {//функция которая оставляет заказ
		$objects = SQLite3::escapeString($_POST['objects']);//проводим данные полученние от пользователя через функцию которая позволяет избежать sql иньекций
		$holder = SQLite3::escapeString($_POST['holder']);
		$arr = json_decode($objects);//декодируем json
		$db = op_db();//открываем базу
		$sum = 0;//получаем сумму заказа на момент его совершения
		foreach($arr as $obj) {//проходимся по каждому элементу заказа
			$id=$obj->id;
			$cost = $db->querySingle("SELECT `cost` FROM `books` WHERE `id`=$id");//получаем ценность книг из бд по их ид
			$sum+=$cost*$obj->count;
		}
		$date = date('c');//получаем текущую дату
		try {
			$db->exec("INSERT INTO `orders` VALUES (NULL, '$objects', '$holder','$date',$sum)");//вписываем в бд заказ,того кто его совершил, дату,сумму,
			$id = $db->querySingle("SELECT seq FROM sqlite_sequence WHERE name='orders'");//получаем номер заказа
			echo json_encode(["status" => "ok","id" => $id]);//формируем ответ и вписываем туда ид заказа
		} catch(Exception $err) {
			echo json_encode(["status" => "err","msg" => "Ошибка при записи в базу данных"]);//формируем ответ ошибки
		}
		$db->close();//закрываем бд
	}

	switch($_POST['action']) {//обрабатываем разные дейтсивя от пользователя
		case 'getBooks':
			getBooks();
			break;
		case 'doOrder':
			doOrder();
			break;
		default://если сделаен необрабатываемый запрос
			echo 'FAIL';
			break;
	}
?>