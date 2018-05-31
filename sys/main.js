const vm = new Vue({//Создаем экземпляр vue для того чтобы можно было использовать переменные и функции через html
	el: '#all',
	data: {
		books: [],//массив с книгами
		nowBook: {img: 'default.png'},//обьект содержащий текущую увеличенную книгу
		shopList: [],//корзина
	},
	methods: {
		littleDesc: littleDesc,
		show: showBook,
		showList: showList,
		add: addToShop,
		del: delFromShop,
		checkInList: checkInList,
		sendOrder: sendOrder,
		countOf: countOf,
		clear: clear,
		img: function(path) {return 'img/'+((path.length>0)?path:'default.png');}
	},
	computed: {
		sumOfShop: sumOfShop,
	}
});


const descSize = 50;//длина краткого описания, если длина описания больше то на витрине показывается не полное описание(в увеличенной версии книги все подробно)

class shopItem {//класс для элементов корзины
	constructor(book) {//в обьектах будут хранится лишь
		this.id = book.id;// id элемента
		this.name = book.name;//название книги(только чтобы в корзине было видно какая книга)
		this.cost = book.cost;//цена книги
		this.count=1;//количество таких товаров
	}
	delete() {//удаление экземпляра книги
		if(this.count==1) {//если удаляется последняя из одинаковых книг
			var index = checkInList(this);
			if(index!==null) {
				vm.shopList.splice(index,1);
			}
		} else {//если несколько одинаковых книг
			this.count--;
		}
	}
	add() {//Добавить книгу к заказу
		this.count++;
	}
	toJSON() {//то как будет переводится этот обьект в формат JSON
		return {//JSON т.к. его удобно хранить в текстовом виде и легко им пользоваться
			id: this.id,
			count: this.count,
		}
	}
}

function clear() {//очищение корзины
	if(vm.shopList.length>0) {
		vm.shopList.splice(0,vm.shopList.length);//удаляем все элементы массива
		//vm.shopList=[] не подходит из-за ообенностей VueJS
		alert('Корзина очищена');
	} else {
		alert('Корзина и так пуста');
	}
}

function countOf(book) {//Функция получения количества книг в корзине
	const index = checkInList(book);
	if(index!==null) {
		return vm.shopList[index].count;
	} else {
		return 0;
	}
}

function checkInList(book) {//Проверка находится ли книга в корзине
	var index=null;;
	try {
		for(var i = 0;i<vm.shopList.length;i++) {
			if(vm.shopList[i].id===book.id) {
				index=i;
				break;
			}
		}
	} catch(err) {
		//console.log(err);
	}
	return index;
}

function sumOfShop() {//Сумма на которую заказано книг
	var sum = 0;
	for(item of this.shopList) {
		sum+=item.cost*item.count;
	}
	return sum;
}

function showBook(book) {//Открытие книги в окошке
	vm.nowBook=book;
	if(vm.nowBook.img.length===0) vm.nowBook.img='default.png';
	bookBG.showModal();
	setTimeout(function(){
		document.addEventListener('click',eventCloseBook,true);
	},0);
}

function showList() {//Открытие корзины
	listBG.showModal();
	setTimeout(function(){
		document.addEventListener('click',eventCloseList,true);
	},0);
}

function eventCloseList(e) {//событие для закрытия корзины
	if(!e.target.closest('#shopList')) {
		listBG.close();
		document.removeEventListener('click',eventCloseList,true);
		e.stopPropagation();
	}
}

function eventCloseBook(e) {//Событие для закрытия увеличенной книги
	if(!e.target.closest('#bigBook')) {
		bookBG.close();
		vm.nowBook={img: 'default.png'};
		document.removeEventListener('click',eventCloseBook,true);
		e.stopPropagation();
	}
}

function addToShop(book) {//Добавить книгу в корзину/увеличить кол-во книг если уже добавлено
	var index=checkInList(book);
	if(index!==null) {
		vm.shopList[index].add();//если книга есть то увеличить их кол-во
	} else {
		vm.shopList.push(new shopItem(book));//если книги нет то добавить
	}
}

function delFromShop(book) {//удалить один экземпляр книги из корзины
	var index=checkInList(book);
	if(index!==null) {
		vm.shopList[index].delete();//Если удаляется последняя одинаковая книга то удаление из корзины обьекта
	}
}

function littleDesc(text) {//Функция которая обрезает описание книги если символов много
	if(text.length<=descSize) {
		return text;
	} else {
		return text.substr(0,descSize-3)+'...';
	}
}

function getBooks() {//Получение списка книг из бд
	var xhr = new XMLHttpRequest();
	xhr.open('POST','sys/main.php',true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4&&xhr.status==200) {//здесь обрабатывается уже завершенный запрос
			try {//попытка преобразовать ответ в формате JSON
				vm.books = JSON.parse(xhr.responseText);
			} catch(err) {//в случае ошибки в консоль выведется код ответа и ошибка
				console.log(xhr.responseText);
				console.log(err);
			}
		}
	}
	xhr.send('action=getBooks');//отправка запроса
}

function sendOrder() {//Отправка заказа
	if(vm.shopList.length>0) {//Проверка если корзина не пуста
		const holder = document.getElementById('holder').value;
		var xhr = new XMLHttpRequest();
		xhr.open('POST','sys/main.php',true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4&&xhr.status==200) {//здесь обрабатывается уже завершенный запрос
				try {//Попытка пропарсить JSON
					const resp = JSON.parse(xhr.responseText);
					if(resp.status=='ok') {//если код ответа "хороший"
						alert(`Заказ успешно размещен\nНомер заказ ${resp.id}`);//вывод номера заказа
						vm.shopList.splice(0,vm.shopList.length);//очищение корзины
					} else {
						alert(resp.msg);//если код ответа другой или его нет вывести alert с текстом ошбки
					}
				} catch(err) {//в случае ошибки в консоль выведется код ответа и ошибка
					console.log(xhr.responseText);
					console.log(err);
				}
			}
		}
		xhr.send('action=doOrder&objects='+JSON.stringify(vm.shopList)+'&holder='+holder);//формирование запроса
		//сначала указываем действие чтобы сервер понял чего мы хотим
		//потом в формате JSON передаем обьекта содержащиеся в корзине
		//в конце вписываем кто оставил заказ
	} else {//если пуста вывести alert
		alert('Список покупок пуст');
	}
}

const listBG = document.getElementById('listBG');//Сокращаем длину кода получая HTML элемент и сразу записывая его в переменную
const bookBG = document.getElementById('bookBG');//аналогично

getBooks();//после загрузки скрипта сразу получаем список книг

