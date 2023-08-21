function getJsonObject(path, success, error) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				if (success) success(JSON.parse(xhr.responseText));
			} else {
				if (error) error(xhr);
			}
		}
	};
	xhr.open("GET", path, true);
	xhr.send();
}

function loadBooks(bookList) {
	function setupBookCheckboxes() {
		let bookCheckboxes = document.querySelectorAll(".bookCheckbox");
		for (let i = 0; i < bookCheckboxes.length; i++) {
			bookCheckboxes[i].addEventListener('change', function () {
				if (this.checked) {
					uncheckBooks();
					this.checked = true;
				}
			});
		}
	}

	let tableBody = document.getElementById("tableBody");
	for (let i = 0; i < bookList.length; i++) {
		let book = createTableRow(bookList[i]);
		tableBody.appendChild(book);
	}

	setupBookCheckboxes();
}

function createTableRow(book) {
	function createCheckbox() {
		let data = document.createElement("td");
		let input = document.createElement("input");
		input.setAttribute("type", "checkbox");
		input.setAttribute("class", "bookCheckbox");
		data.appendChild(input);
		return data;
	}
	
	function createThumbnail(imgPath) {
		let data = document.createElement("td");
		let img = document.createElement("img");
		img.setAttribute("src", imgPath);
		img.setAttribute("class", "thumbnail");
		data.appendChild(img);
		return data;
	}
	
	function createTitle(title) {
		let data = document.createElement("td");
		data.setAttribute("class", "title");
		let text = document.createTextNode(title);
		data.appendChild(text);
		return data;
	}
	
	function createRating(rating) {
		let data = document.createElement("td");
		let ratingInt = parseInt(rating);
	
		// Full stars
		for (let i = 0; i < ratingInt; i++) {
			let img = document.createElement("img");
			img.setAttribute("src", "images/star-16.ico");
			data.appendChild(img);
		}
	
		// Empty stars
		let emptyStarCnt = 5 - ratingInt;
		for (let i = 0; i < emptyStarCnt; i++) {
			let img = document.createElement("img");
			img.setAttribute("src", "images/outline-star-16.ico");
			data.appendChild(img);
		}
		return data;
	}
	
	function createPlainText(plaintext) {
		let data = document.createElement("td");
		let text = document.createTextNode(plaintext);
		data.appendChild(text);
		return data;
	}

	let row = document.createElement("tr");
	row.setAttribute("id", book.title);
	row.setAttribute("class", "books")

	let checkbox = createCheckbox();
	row.appendChild(checkbox);

	let thumbnail = createThumbnail(book.img);
	row.appendChild(thumbnail);

	let title = createTitle(book.title);
	row.appendChild(title);

	let rating = createRating(book.rating);
	row.appendChild(rating);

	let authors = createPlainText(book.authors);
	row.appendChild(authors);

	let year = createPlainText(book.year);
	row.appendChild(year);

	let price = createPlainText(book.price);
	row.appendChild(price);

	let publisher = createPlainText(book.publisher);
	row.appendChild(publisher);

	let category = createPlainText(book.category);
	row.appendChild(category);

	return row;
}

function setupSearchBtn(bookList) {
	let searchBtn = document.getElementById("searchBtn");
	let searchBar = document.getElementById("searchBar");
	searchBtn.onclick = function (e) {
		var term = searchBar.value.trim();
		let highlighted = highlightBooks(bookList, term);
		if (!highlighted) {
			prevTerm = "";
			alert("No books have been found with the searched term");
		}
	}

	searchBar.addEventListener('keydown', function (e) {
		if (e.key == 'Enter') {
			e.preventDefault();
			searchBtn.click();
		}
	})
}

function highlightBooks(bookList, term) {
	function checkBookExists() {
		let booksFound = [];
		term = term.toLowerCase();
		for (let i = 0; i < bookList.length; i++) {
			var bookTitle = bookList[i].title;
			let bookTitleLower = bookTitle.toLowerCase();
			if (bookTitleLower.includes(term) && checkIfBookDisplayed(bookTitle)) {
				booksFound.push(bookList[i]);
			}
		}
	
		return booksFound;
	}

	function checkIfBookDisplayed(bookTitle) {
		let book = document.getElementById(bookTitle);
		if (book.style.display == 'none') {
			return false;
		}
		return true;
	}

	function changeHighlight(books, colour) {
		for (let i = 0; i < books.length; i++) {
			let row = document.getElementById(books[i].title);
			row.style.backgroundColor = colour;
		}
	}

	if (term == "") {
		changeHighlight(bookList, tableBackgroundColour);
		prevTerm = term;
	}
	else {
		let booksFound = checkBookExists(bookList, term);
		if (booksFound.length > 0) {
			changeHighlight(bookList, tableBackgroundColour);
			changeHighlight(booksFound, highlightColour);
			prevTerm = term;
		}
		else {
			changeHighlight(bookList, tableBackgroundColour);
			return false;
		}
	}
	return true;
}

function loadFilterCategories(bookList) {
	function storeCategories(category) {
		let found = false;
		for (let i = 0; i < allCategories.length; i++) {
			if (category == allCategories[i]) {
				found = true;
				break;
			}
		}
		if (!found) {
			allCategories.push(category);
		}
	}

	function createOption(category) {
		let option = document.createElement("option");
		option.setAttribute("value", category)

		let text = document.createTextNode(category)
		option.appendChild(text);
		return option;
	}

	let allCategories = ["All categories", "Romance"];
	for (let i = 0; i < bookList.length; i++) {
		storeCategories(bookList[i].category);
	}

	filterDropdown = document.getElementById("filter");
	for (let i = 0; i < allCategories.length; i++) {
		let option = createOption(allCategories[i]);
		filterDropdown.appendChild(option);
	}
}

function setupFilterBtn(bookList) {
	function changeDisplayAllBooks(value) {
		let books = document.querySelectorAll(".books");
		for (let i = 0; i < books.length; i++) {
			let book = books[i];
			book.style.display = value;
		}
	}

	function changeDisplayBook(id, value) {
		let row = document.getElementById(id);
		row.style.display = value;
	}

	function checkCategoryHasBooks(category) {
		for (let i = 0; i < bookList.length; i++) {
			if (bookList[i].category == category) {
				return true;
			}
		}
		return false;
	}

	function displayBooksInCategory(category) {
		changeDisplayAllBooks('');
		for (let i = 0; i < bookList.length; i++) {
			if (bookList[i].category == category) {
				changeDisplayBook(bookList[i].title, '');
			}
			else {
				changeDisplayBook(bookList[i].title, 'none');
			}
		}
	}

	let filterBtn = document.getElementById("filterBtn");
	let filterDropdown = document.getElementById("filter");
	filterBtn.onclick = function (e) {
		let category = filterDropdown.value;
		if (category == "All categories") {
			uncheckBooks();
			changeDisplayAllBooks('');
			highlightBooks(bookList, prevTerm);
		}
		else {
			let exists = checkCategoryHasBooks(category, bookList);
			if (exists) {
				uncheckBooks();
				displayBooksInCategory(category, bookList);
				highlightBooks(bookList, prevTerm);
			}
			else {
				alert("No books found with the selected category");
			}
		}
	}
}

function uncheckBooks() {
	let bookCheckboxes = document.querySelectorAll(".bookCheckbox");
	for (let i = 0; i < bookCheckboxes.length; i++) {
		bookCheckboxes[i].checked = false;
	}
}

function setupAddBtn() {
	let addBtn = document.getElementById("addBtn");
	let cartCount = document.getElementById("cartCount");
	addBtn.onclick = function (e) {
		let bookCheckboxes = document.querySelectorAll(".bookCheckbox");
		let selected = false;
		for (let i = 0; i < bookCheckboxes.length; i++) {
			if (bookCheckboxes[i].checked) {
				selected = true;
				break;
			}
		}
		if (!selected) {
			alert("Please select a book to add");
			return;
		}

		let quantity = prompt("Quantity");
		if (quantity === null) {
			return;
		}

		quantity = parseInt(quantity);
		let valid = true;
		if (isNaN(quantity)) {
			valid = false;
		}
		else if (quantity < 1) {
			valid = false;
		}

		if (valid) {
			let countStr = cartCount.innerHTML
			let count = countStr.substring(1, countStr.length - 1);
			let newCount = parseInt(count) + quantity
			let newCountStr = "(" + newCount + ")";
			cartCount.innerHTML = newCountStr;
			uncheckBooks();
		}
		else {
			alert("Invalid quantity");
		}
	}
}

function setupResetBtn() {
	let resetBtn = document.getElementById("resetBtn");
	let cartCount = document.getElementById("cartCount");
	resetBtn.onclick = function (e) {
		if (confirm("Is it okay to reset the cart?")) {
			cartCount.innerHTML = "(0)";
		}
	}
}

function setupDarkModeCheck(bookList) {
	function changeMode(bodyBgCol, textCol, searchBoxBgCol, listBoxBgCol, captionBgCol) {
		let body = document.querySelector("body");
		body.style.backgroundColor = bodyBgCol;
		body.style.color = textCol;

		let searchBox = document.getElementById("searchBox");
		searchBox.style.backgroundColor = searchBoxBgCol;
		searchBox.style.borderColor = captionBgCol;

		let listBox = document.getElementById("listBox");
		listBox.style.backgroundColor = listBoxBgCol;
		listBox.style.borderColor = captionBgCol;

		highlightBooks(bookList, prevTerm);
		let td = document.querySelectorAll("td");
		for (let i = 0; i < td.length; i++) {	
			td[i].style.borderColor = captionBgCol;
		}

		let thead = document.querySelector("thead");
		thead.style.backgroundColor = searchBoxBgCol;

		let caption = document.querySelector("caption");
		caption.style.backgroundColor = captionBgCol;
	}


	let checkbox = document.getElementById("darkModeCheckbox");
	checkbox.addEventListener('change', function () {
		if (this.checked) { // dark mode
			highlightColour = "#575757";
			tableBackgroundColour = "#353535";
			let bodyBgCol = "#2b2b2b";
			let textCol = "#ffffff";
			let searchBoxBgCol = "#454545";
			let listBoxBgCol = "#353535";
			let captionBgCol = "#787878";
			changeMode(bodyBgCol, textCol, searchBoxBgCol, listBoxBgCol, captionBgCol)

		}
		else { // light mode
			highlightColour = "#cce3f5";
			tableBackgroundColour = "#fafcff";
			let bodyBgCol = "#ffffff";
			let textCol = "#000000";
			let searchBoxBgCol = "#ebf4fb";
			let listBoxBgCol = "#fafcff";
			let captionBgCol = "#95bef0";
			changeMode(bodyBgCol, textCol, searchBoxBgCol, listBoxBgCol, captionBgCol)
		}
	});
}



var prevTerm = "";
var highlightColour = "#cce3f5";
var tableBackgroundColour = "#fafcff";

window.onload = function () {
	bookList = []; // book list container
	getJsonObject(
		"data.json",
		function (data) {
			bookList = data; // store the book list into bookList
			// let bookListOriginal = bookList.slice();
			console.log(bookList); // print it into console (developer tools)
			console.log(bookList[0]); // print the first book object into console
			// here you can call methods to laod or refresh the page
			// loadBooks() or refreshPage()
			loadBooks(bookList);
			
			setupSearchBtn(bookList);
			loadFilterCategories(bookList);
			setupFilterBtn(bookList);
			setupAddBtn();
			setupResetBtn();
			setupDarkModeCheck(bookList);
		},
		function (xhr) {
			console.error(xhr);
		}
	);	
};
