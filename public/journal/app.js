const isUrl = require('is-url') //validates url

const DATABASE_URL = 'http://localhost:3030'


	// Get journal entries
// *********************************** //
	function getJournalEntries(callback){
		$.getJSON(DATABASE_URL + '/entry/entries', callback)
	}

	
		//displays journal entries in correct location on DOM
		//depending on priority
	function displayJournalEntries(data){
		
			//if user has no entries in journal, it renders
			//a message saying such
		if (data.message){
			$('#linkSection').empty()
			let messageHTMl = '<div class=\'postDiv\'>' +
									'<p>' + data.message + '</p>' +
								'</div>';

			$('#linkSection').append(messageHTMl)
		}

		$('.postDiv').remove()

		for (index in data.entries) {
			let entry = data.entries[index]
			let entryHTML = '<div class=\"postDiv\" id=\"' + entry.entryId + '\">' +
								'<p class=\"linkTitle\" value=\"' + entry.priority + '\"><a class=\"url\" href=\"' + entry.link + '\">' + entry.title + '</a></p>' +
								`<p class=\'expiryDate\'>${entry.expiry}</p>` +
								'<div class=\"editDiv\">' +
									'<button class=\"edit udButton hidden\">Edit</button>' +
								'</div>' +
								'<div class=\"deleteDiv\">' + 
									'<button class=\"delete udButton hidden\">Delete</button>' + 
								'</div>' +
							'</div>'


			switch(entry.priority){
				case "high": 
					$('#highPriority').append(entryHTML)
					break;
				case "medium": 
					$('#medPriority').append(entryHTML)
					break;
				case "low":
					$('#lowPriority').append(entryHTML)
					break;
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
								"<form id=\"newLinkForm\">" +
									"<label>Title</label>" +
									"<input type=\"text\" name=\"title\" placeholder=\"Title\" id=\"linkTitle\"></input>" +
									"<label>Link</label>" +
									"<input type=\"text\" name=\"link\" placeholder=\"www.google.com\" id=\"linkUrl\"></input>" +
									"<label>Priority</label>" +
									"<select name=\"priority\" id=\"linkPriority\">" +
										"<option value=\"high\">High</option>" +
										"<option value=\"medium\" selected>Medium</option>" +
										"<option value=\"low\">Low</option>" +
									"<input type=\"submit\" name=\"submit\" id=\"newLinkFormSubmit\"></input>" +
									"<button type=\"cancel\">Cancel</button>" +
								"<form>" +
							"</div>";

		$('#newLink').on('click', () => {
			if(!($('#newLinkForm').length)){
				$('#linkSection').prepend(formTemplate)
			}
		})
	}


	function postJournalEntry(){
		$("#linkSection").on('click', '#newLinkFormSubmit', (event) => {

			let title = $('#linkTitle').val()
			let url =  (isUrl($('#linkUrl').val()) == true) ? $('#linkUrl').val() : "http://" + $('#linkUrl').val() //ensures link is a url otherwise it appends http:// at the beginning
			let priority = $('#linkPriority').val()

				//ensures user enters a title that is
				//not just a blank space
			if (title.search(/[a-zA-Z0-9]/g) == -1){
				alert('please enter a title for your entry')
				$('#linkTitle').focus()
				return 
			}

			let newLink = {
				'title': title,
				'priority': priority,
				'link': url
			}

			$.ajax({
				type: 'POST',
				url: DATABASE_URL + '/entry',
				data: JSON.stringify(newLink),
				contentType: 'application/json',
				success: function(){
					location.reload()
				}
			})

		})
	}

// *********************************** //

	// Put journal entries
// *********************************** //
	function addUpdateEntriesForm(){
		$("#linkSection").on('click', ".edit", function(){
			
			
				//grabs link information to add as placeholder in 
				//form to make editing easier for user
			let parentDiv = $(this).parent().parent() //targets postDiv
			let linkURL = $(parentDiv).children('.linkTitle').children('.url').attr('href') //grabs the url of link
			let linkTitle = $(parentDiv).children('.linkTitle').text() //grabs title of link
			let linkPriority = $(parentDiv).children('.linkTitle').attr('value') //grabs priority of link
			let linkID = $(parentDiv).attr('id') //grabs id of link

			let formTemplate = "<div class=\"editForm\" id=\"editLinkFormDiv-" + linkID + "\">" +
						"<form id=\"editLinkForm\">" +
							"<label>Title</label>" +
							"<input type=\"text\" name=\"title\" placeholder=\"Title\" id=\"linkTitle\" value=\"" + linkTitle + "\"></input>" +
							"<label>Link</label>" +
							"<input type=\"text\" name=\"link\" placeholder=\"www.google.com\" id=\"linkUrl\" value=\"" + linkURL + "\"></input>" +
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
				
				$(parentDiv).prepend(formTemplate)
				
				//this custom sets the selected option depending on the user's previous choice
				let priorityFormOption = formParentDiv + ' > #editLinkForm > #linkPriority > ' + "#" + linkPriority
				$(priorityFormOption).attr("selected", 'selected')
			}
			
			updateEntryInDatabase()
		})
	}

	function updateEntryInDatabase(){
		$('#editLinkFormSubmit').on('click', function(event){
			
			
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
				url: DATABASE_URL + '/entry/' + id,
				data: JSON.stringify(editEntry),
				contentType: 'application/json',
				success: function(){
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
			let parentDiv = $(this).parent().parent()
			let entryId = $(parentDiv).attr('id')


			$.ajax({
				type: 'delete',
				url: DATABASE_URL + "/entry/" + entryId,
				success: function(){
					location.reload()
				}
			})
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
					url: DATABASE_URL + '/logout',
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
