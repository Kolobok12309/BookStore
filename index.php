<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>BookStore</title>
	<script type="text/javascript" src="sys/vue.js"></script>
	<link rel="stylesheet" type="text/css" href="sys/style.css">
</head>
<body>
	<div id='all'>
		<span v-on:click='showList' id='buttonList'>LIST</span>
		<center id='Books'>
			<div v-for='book in books' v-on:click='show(book)' class='book'>
				<img class='BookImage' v-bind:src='img(book.img)'>
				<div class='inf'>
					<span class='title'>{{book.name}}</span>
					<br>
					<span class='author'>Author: {{book.author}}</span>
					<br>
					<span class='cost'>Cost: {{book.cost}}</span>
					<br>
					<span class='littleDesc'>{{littleDesc(book.desc)}}</span>
				</div>
				<button v-on:click.stop='add(book)'>+</button>
				<div v-show='checkInList(book)!==null'>
					<span>{{countOf(book)}}</span>
					<button v-on:click.stop='del(book)'>-</button>
				</div>
			</div>
		</center>
		<div id='bigBook' v-show='stateBook'>
			<span>ТИПО МОДАЛЬНОЕ ОКНО КЛИК ВНЕ НЕГО УБЕРЕТ ЕГО</span><br>
			<img class='BookImage' v-bind:src='img(nowBook.img)'>
			<span class='title'>{{nowBook.title}}</span>
			<br>
			<span class='autor'>{{nowBook.author}}</span>
			<br>
			<span class='desc'>{{nowBook.desc}}</span>
			<br>
			<span>COST: {{nowBook.cost}}</span>
			<br>
			<button v-on:click='add(nowBook)'>+</button>
			<div v-show='checkInList(nowBook)!==null'>
				<span>{{countOf(nowBook)}}</span>
				<button v-on:click.stop='del(nowBook)'>-</button>
			</div>
		</div>
		<form id='shopList' v-on:submit.prevent='sendOrder' v-show='stateList'>
			<span>ТИПО МОДАЛЬНОЕ ОКНО КЛИК ВНЕ НЕГО УБЕРЕТ ЕГО</span><br>
			<span>SHOPLIST</span>
			<div v-for='item in shopList'>
				<span>id: {{item.id}}</span>
				<span>name: {{item.name}}</span>
				<span>Cost: {{item.cost}}</span>
				<span>Count: {{item.count}}</span>
				<button type='button' v-on:click='add(item)'>+</button>
				<button type='button' v-on:click='del(item)'>-</button>
			</div>
			<span>SUM: {{sumOfShop}}</span>
			<br>
			<input id='holder' type='text' placeholder="holder" required>
			<button type='submit'>ORDER</button>
			<button type='button' v-on:click='clear'>CLEAR</button>
		</form>
	</div>
	<script type="text/javascript" src='sys/main.js'></script>
</body>
</html>