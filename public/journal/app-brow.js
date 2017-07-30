(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * Expose `isUrl`.
 */

module.exports = isUrl;

/**
 * Matcher.
 */

var matcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;

/**
 * Loosely validate a URL `string`.
 *
 * @param {String} string
 * @return {Boolean}
 */

function isUrl(string){
  return matcher.test(string);
}

},{}],2:[function(require,module,exports){
const isUrl = require('is-url') //validates url

	// Get journal entries
// *********************************** //
	function getJournalEntries(callback){
		$.ajax({
			type: 'get',
			url: '/entry/entries',
			success: function(data){
				callback(data)
			},
			error: function(err){
				alert('please log in')
				window.location.href = '/login'
			}
		})
	}

	
		//displays journal entries in correct location on DOM
		//depending on priority
	function displayJournalEntries(data){
			//if user has no entries in journal, it renders
			//a message saying such
		if (data.message){
			$('#linkSection').empty()
			let messageHTMl = 	'<div id=\"noEntryContainer\">' +
									'<div id=\'emptyMessage\'>' +
										'<p>' + data.message + '</p>' +
									'</div>' +
									'<div id="linkButtonContainer">' +
										'<button type=\"button\" class=\"btn btn-default\" id=\"newLink\">Add An Entry</button>' +
									'</div>' +
								'</div>'


			$('#linkSection').append(messageHTMl)
		}
		else {

			$('.postDiv').remove()

			let highCounter = 0
			let mediumCounter = 0
			let lowCounter = 0

			let highArray = [],
				mediumArray = [],
				lowArray = []

			let highHtml = '<div class=\"row\">'
			let mediumHtml = '<div class=\"row\">'
			let lowHtml = '<div class=\"row\">'


			for (index in data.entries) {
				let entry = data.entries[index]
				let expiryDateFormat = countdown(new Date(Date.now()), new Date(entry.expiry), countdown.DAYS).toString()
				let expiryDate = (expiryDateFormat == '') ? "Expires in " + countdown(new Date(Date.now()), new Date(entry.expiry), countdown.HOURS).toString() : "Expires in " + expiryDateFormat
				
				if(Date.parse(new Date(entry.expiry))-Date.parse(new Date())<0){
					   expiryDate = 'Expires tonight'
				}

				let entryHtml = `<div class='postContainer col-xs-12 col-sm-6 col-lg-4'>` + 
									'<div class=\"postDiv\" id=\"' + entry.entryId + '\">' +
										'<p class=\"linkTitle\" value=\"' + entry.priority + '\">' + entry.title + '</p>' +
										`<a class="url" href='${entry.link}'><span class='linkSpan'></span></a>` +
										`<div class="postImage">` +
											`<img src='${entry.image}'></img>` +
										`</div>` +
										`<div class="infoRow row">` +
											`<div class="col-xs-6">` +
												`<p class='pull-left expiryDate'>${expiryDate}</p>` + 
											`</div>` +
											`<div class='manipGroup btn-group col-xs-6' role='group' aria-label='...'>` +
													'<span class=\"delete pull-right glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>' + 
													'<span class=\"edit pull-right glyphicon glyphicon-edit\" aria-hidden=\"true\"></span>' +
											`</div>` +
										'</div>' +
									'</div>' +
								'</div>'


				switch(entry.priority){
					case "high": 
						highArray.push(entryHtml)

						break;
					case "medium": 
						mediumArray.push(entryHtml)

						break;
					case "low":
						lowArray.push(entryHtml)

						break;
				}
			}

			for (index in highArray){
					//finishes the div if there's less than three in the the row
				if (index == highArray.length - 1){
					highHtml += highArray[index] + "</div>"
					$('#highPriority').append(highHtml)
				}
				else if(highCounter < 3){
					highHtml += highArray[index]
					highCounter++
				}
				else if(highCounter == 3){
					highHtml += "</div>"
					$('#highPriority').append(highHtml)

					highHtml = '<div class=\"row\">'
					highHtml += highArray[index]
					highCounter = 2 //this is two because i've pushed an element right before.	
				}
			}

			for (index in mediumArray){
					//finishes the div if there's less than three in the the row
				if (index == mediumArray.length - 1){
					mediumHtml += mediumArray[index] + "</div>"
					$('#medPriority').append(mediumHtml)
				}
				else if(mediumCounter < 3){
					mediumHtml += mediumArray[index]
					mediumCounter++
				}
				else if(mediumCounter == 3){
					mediumHtml += "</div>"
					$('#medPriority').append(mediumHtml)

					mediumHtml = '<div class=\"row\">'
					mediumHtml += mediumArray[index]
					mediumCounter = 1 //this is two because i've pushed an element right before.	
				}
			}

			for (index in lowArray){
					//finishes the div if there's less than three in the the row
				if (index == lowArray.length - 1){
					lowHtml += lowArray[index] + "</div>"
					$('#lowPriority').append(lowHtml)
				}
				else if(lowCounter < 3){
					lowHtml += lowArray[index]
					lowCounter++
				}
				else if(lowCounter == 3){
					lowHtml += "</div>"
					$('#lowPriority').append(lowHtml)

					lowHtml = '<div class=\"row\">'
					lowHtml += lowArray[index]
					lowCounter = 2 //this is two because i've pushed an element right before.	
				}
			}

		}
	}

	function getAndDisplayJournalEntries(){
		getJournalEntries(displayJournalEntries)
	}
// *********************************** //


	// Post journal entries
// *********************************** //
	
	function addJournalEntryForm(){
		let formTemplate = "<div id=\"newLinkFormDiv\">" +
								"<h2 id=\"formTitle\">tabby</h2>" +
								"<form id=\"newLinkForm\">" +
									"<button type=\"cancel\" id=\"cancelNewForm\" class=\"pull-right btn btn-danger\"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span></button>" +
									"<div class=\"form-group\">" +
										"<label>Link</label>" +
										"<input type=\"text\" class=\"form-control\" name=\"link\" placeholder=\"www.google.com\" id=\"linkUrl\"></input>" +
									"</div>" +
									"<div class=\"form-group\">" +
										"<label for=\"linkPriority\">Priority</label>" +
										"<select class=\"form-control\" name=\"priority\" id=\"linkPriority\">" +
											"<option value=\"high\">High</option>" +
											"<option value=\"medium\" selected>Medium</option>" +
											"<option value=\"low\">Low</option>" +
										"</select>" +
									"</div>" +
									"<div class=\"form-group\" id=\"submitDiv\">" +
										"<input type=\"submit\" name=\"submit\" id=\"newLinkFormSubmit\" class=\"btn btn-primary\"></input>" +
									"</div>"
								"<form>" +
							"</div>";

		$('body').on('click', '#newLink', () => {
			if(!($('#newLinkForm').length)){
				$('#linkSection').empty()
				$('#linkSection').prepend(formTemplate)
				$('html, body').animate({
			    scrollTop: $("#newLinkFormDiv").offset().top
			}, 1000);
			}
		})
	}


	function postJournalEntry(){
		$("#linkSection").on('click', '#newLinkFormSubmit', (event) => {
			event.preventDefault()

			let url =  (isUrl($('#linkUrl').val()) == true) ? $('#linkUrl').val() : "http://" + $('#linkUrl').val() //ensures link is a url otherwise it appends http:// at the beginning
			let priority = $('#linkPriority').val()


			let newLink = {
				'priority': priority,
				'link': url
			}

			$.ajax({
				type: 'POST',
				url: '/entry',
				data: JSON.stringify(newLink),
				contentType: 'application/json',
				success: function(data){
					alert('successfully posted')
					window.location.reload(true)
				},
				error: function (request, status, error) { console.log(request); console.log(status); console.log(error) }
			})
		})
	}


// *********************************** //

	// Put journal entries
// *********************************** //
	function addUpdateEntriesForm(){
		$("#linkSection").on('click', ".edit", function(){
			
			console.log('yolo')
			
				//grabs link information to add as placeholder in 
				//form to make editing easier for user
			let parentDiv = $(this).parent().parent().parent() //targets postDiv
			let linkPriority = $(parentDiv).children('.linkTitle').attr('value') //grabs priority of link
			let linkID = $(parentDiv).attr('id') //grabs id of link

			let formTemplate = "<div class=\"editForm\" id=\"editLinkFormDiv-" + linkID + "\">" +
						"<form id=\"editLinkForm\">" +
							"<label>Priority</label>" +
							"<select name=\"priority\" id=\"linkPriority\">" +
								"<option id=\"high\" value=\"high\">High</option>" +
								"<option id=\"medium\"value=\"medium\">Medium</option>" +
								"<option id=\"low\" value=\"low\">Low</option>" +
							"<input type=\"submit\" name=\"submit\" id=\"editLinkFormSubmit\"></input>" +
							"<button type=\'cancel\' id=\'cancelEditForm\'>Cancel</button>"
						"<form>" +
					"</div>";

			let formParentDiv = "#editLinkFormDiv-" + linkID
			
				// prevents user from accidentally hitting edit multiple times
			if (!($(parentDiv).children(formParentDiv).length)){
				
					//removes any other edit forms if one already exists
				$('#linkSection').children().children().children(".editForm").remove()
				
				$(parentDiv).append(formTemplate)
				
				//this custom sets the selected option depending on the user's previous choice
				let priorityFormOption = formParentDiv + ' > #editLinkForm > #linkPriority > ' + "#" + linkPriority
				$(priorityFormOption).attr("selected", 'selected')
			}
			
			updateEntryInDatabase()
		})
	}

	function updateEntryInDatabase(){
		$('#editLinkFormSubmit').on('click', function(event){
			event.preventDefault()
			
				// edit form has id of editLinkFormDiv-id,
				//splits the id on hyphen and returns database id
			let id = $(".editForm").attr('id').split('-')[1]

			let editEntry = {
				entryId: id,
				title: $("#linkTitle").val(),
				priority: $('#linkPriority').val(),
				link: $('#linkUrl').val()
			}

			$.ajax({
				type: 'put',
				url: '/entry/' + id,
				data: JSON.stringify(editEntry),
				contentType: 'application/json',
				success: function(){
					getAndDisplayJournalEntries()
					location.reload()
				}
			})
		})
	}
// *********************************** //

	// Delete journal entries
// *********************************** //
	function deleteEntry(){
		$('#linkSection').on('click', '.delete', function(){
			let parentDiv = $(this).parent().parent().parent() //targets postDiv
			let entryId = $(parentDiv).attr('id')
			let entryTitle = $(parentDiv).children('.linkTitle').text()

			if(confirm(`Are you sure you want to delete ${entryTitle}?`)){
					$.ajax({
						type: 'delete',
						url: "/entry/" + entryId,
						success: function(){
							getAndDisplayJournalEntries()
						}
					})
			}
		})
	}

	function deleteEntryFromDataBase(){
		deleteEntry()
	}
// *********************************** //

	// Signout
// *********************************** //
	function signout(){
		$('#logOut').click((event) => {
			if(confirm('Log out?')){
				$.ajax({
					type: 'get',
					url: '../logout',
					success: function(data) {
						alert(data.message)
						window.location.href = data.redirect
					}
				})
			}
		})
	}

// *********************************** //



	//Add and remove edit features
// *********************************** //
	function addEditDeleteButtons(){
		$("#editLink").on('click', () => {
			$('.udButton').removeClass('hidden')
		})
	}

	function removeEditDeleteButtons(){
		$('.udButton').addClass('hidden')
	}
// *********************************** //
 
$(() => {
	getAndDisplayJournalEntries()
	addJournalEntryForm()
	postJournalEntry()
	addEditDeleteButtons()
	addUpdateEntriesForm()
	deleteEntryFromDataBase()
	signout()
})

},{"is-url":1}]},{},[2]);
