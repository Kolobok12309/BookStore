const vm = new Vue({
	el: '#all',
	data: {
		books: [],
		nowBook: {img: 'default.png'},
		shopList: [],
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


const descSize = 50;

class shopItem {
	constructor(book) {
		this.id = book.id;
		this.name = book.name;
		this.cost = book.cost;
		this.count=1;
	}
	delete() {
		if(this.count==1) {
			var index = checkInList(this);
			if(index!==null) {
				vm.shopList.splice(index,1);
			}
		} else {
			this.count--;
		}
	}
	add() {
		this.count++;
	}
	toJSON() {
		return {
			id: this.id,
			count: this.count,
		}
	}
}

function clear() {
	if(vm.shopList.length>0) {
		vm.shopList.splice(0,vm.shopList.length);
		alert('Корзина очищена');
	} else {
		alert('Корзина и так пуста');
	}
}

function countOf(book) {
	const index = checkInList(book);
	if(index!==null) {
		return vm.shopList[index].count;
	} else {
		return 0;
	}
}

function checkInList(book) {
	var index=null;;
	try {
		for(var i = 0;i<vm.shopList.length;i++) {
			if(vm.shopList[i].id===book.id) {
				index=i;
				break;
			}
		}
	} catch(err) {
		console.log(err);
	}
	return index;
}

function sumOfShop() {
	var sum = 0;
	for(item of this.shopList) {
		sum+=item.cost*item.count;
	}
	return sum;
}

function showBook(book) {
	vm.nowBook=book;
	if(vm.nowBook.img.length===0) vm.nowBook.img='default.png';
	bookBG.showModal();
	setTimeout(function(){
		document.addEventListener('click',eventCloseBook,true);
	},0);
}

function showList() {
	listBG.showModal();
	setTimeout(function(){
		document.addEventListener('click',eventCloseList,true);
	},0);
}

function eventCloseList(e) {
	if(!e.target.closest('#shopList')) {
		listBG.close();
		document.removeEventListener('click',eventCloseList,true);
		e.stopPropagation();
	}
}

function eventCloseBook(e) {
	if(!e.target.closest('#bigBook')) {
		bookBG.close();
		vm.nowBook={img: 'default.png'};
		document.removeEventListener('click',eventCloseBook,true);
		e.stopPropagation();
	}
}

function addToShop(book) {
	var index=checkInList(book);
	if(index!==null) {
		vm.shopList[index].add();
	} else {
		vm.shopList.push(new shopItem(book));
	}
}

function delFromShop(book) {
	var index=checkInList(book);
	if(index!==null) {
		vm.shopList[index].delete();
	}
}

function littleDesc(text) {
	if(text.length<=descSize) {
		return text;
	} else {
		return text.substr(0,descSize-3)+'...';
	}
}

function getBooks() {
	var xhr = new XMLHttpRequest();
	xhr.open('POST','sys/main.php',true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4&&xhr.status==200) {
			try {
				vm.books = JSON.parse(xhr.responseText);
			} catch(err) {
				console.log(xhr.responseText);
				console.log(err);
			}
		}
	}
	xhr.send('action=getBooks');
	setTimeout(getBooks,30000);
}

function sendOrder() {
	if(vm.shopList.length>0) {
		const holder = document.getElementById('holder').value;
		var xhr = new XMLHttpRequest();
		xhr.open('POST','sys/main.php',true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4&&xhr.status==200) {
				try {
					const resp = JSON.parse(xhr.responseText);
					if(resp.status=='ok') {
						alert(`Заказ успешно размещен\nНомер заказ ${resp.id}`);
						vm.shopList.splice(0,vm.shopList.length);
					} else {
						alert(resp.msg);
					}
				} catch(err) {
					console.log(xhr.responseText);
					console.log(err);
				}
			}
		}
		xhr.send('action=doOrder&objects='+JSON.stringify(vm.shopList)+'&holder='+holder);
	} else {
		alert('Список покупок пуст');
	}
}

const listBG = document.getElementById('listBG');
const bookBG = document.getElementById('bookBG');

getBooks();
