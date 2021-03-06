const windowURL = window.location.origin


function format(){
	let elementArray = ['#currentEmail', '#currentPassword', '#newEmail', '#confirmNewEmail']
	
	let errorCount = 0,
		filledCount = 0
		
		elementArray.forEach(element => {
			
			if($(element).val() !== ""){
				filledCount++
			} 

			else if ($(element).val() == ''){
				let parent = $(element).parent()
				$(element).removeClass('valid')
				$(element).removeClass('error')
				$(parent).children('.feedback').remove()
				$(parent).removeClass('has-success')
				$(parent).removeClass('has-danger')
				$('#registerButton').prop('disabled', true)
				errorCount++

			}

			if ($(element).hasClass('error')){
					let parent = $(element).parent()
					$(element).removeClass('valid')
					$(parent).children('.feedback').remove()
					$(parent).removeClass('has-success').addClass('has-danger')
					$('#registerButton').prop('disabled', true)
					errorCount++
			}
		}) 

		if(errorCount == 0 && filledCount === 4){
			$('#submitButton').prop('disabled', false)
		} 
}

function displayError(){
	$('input').on('keydown', () => {
		setTimeout(format, 100)
	})
}

function validateForm(){
	$('#changeEmail').validate({
		rules: {
			currentEmail:{
				required: true,
				email: true
			},
			currentPassword: "required",
			newEmail: {
				required: true,
				email: true
			},
			confirmNewEmail: {
				equalTo: "#newEmail"
			}
		},

		// changes success messages
	success: function(label){
    		let successHtml =   
	    		`<span class="glyphicon glyphicon-ok form-control-feedback feedback" aria-hidden="true"></span>` +
	  			`<span id="inputSuccess2Status" class="sr-only feedback">(success)</span>`

    		if (label[0].htmlFor === 'newEmail'){
			    let data = {
					email: $('#newEmail').val()
				}

				$.ajax({
					type: 'post',
					url: windowURL + '/users/email',
					data: JSON.stringify(data),
					contentType: 'application/json',
					success: function(data){
							//provides instant feedback to user about email
						if (data.message === 'Email has already been used to create an account'){
							   let parent = $('#newEmail').parent()
			    				$(parent).removeClass('has-success')
			    				$(parent).children('.feedback').remove()

								$('#newEmail').removeClass('valid').addClass('error')
								$('#newEmail-error').text(data.message)
						}
						else{
				    		let parent = $(label).parent()
				    		$(parent).removeClass('has-danger').addClass('has-success')
				    		$(parent).children('.feedback').remove()
				    		$(parent).append(successHtml)
				    		$(label).remove()
						}
					}
				})
    		}
			else{
	    		let parent = $(label).parent()
	    		$(parent).removeClass('has-danger').addClass('has-success')
	    		$(parent).children('.feedback').remove()
	    		$(parent).append(successHtml)
	    		$(label).remove()
	    	}
		},
		// changes error messages
		messages: {
			currentPassword: "Please enter your current password",
			newPassword: "Please enter a new password",
			confirmNewPassword: "Please enter a matching password"
		}
	})	         
}

function changeEmail(){
	$("#submitButton").on('click', (event) => {
		event.preventDefault()
		let currentPassword = $('#currentPassword').val()
		let currentEmail = $('#currentEmail').val()
		let loginData;
		let newPasswordData;
		let id;

			//failsafe in case validator fails
		if($('#newEmail').val() == $('#confirmNewEmail').val()){
		
				//follows pattern get user info to get user id > logout > login with provided current password and email
				//if successfully logged in then email is updated
			$.ajax({
				type: 'get',
				url: windowURL + '/users/me',
				success: function(data){
					loginData = {
						email: currentEmail,
						password: currentPassword
					}

					id = data.user.id;

					newEmailData = {
						id: id, 
						email: $('#newEmail').val()
					}

					$.ajax({
						type: 'get',
						url: windowURL + '/logout',
						success: function(){

							$.ajax({
								type: 'post',
								url: windowURL + '/login',
								data: JSON.stringify(loginData),
								contentType: 'application/json',
								success: function(data){

									$.ajax({
										type: 'put',
										url: windowURL + `/users/${id}`,
										data: JSON.stringify(newEmailData),
										contentType: 'application/json',
										success: function(data){
											alert('Email successfully changed')
											window.location.href = windowURL + '/profile'
										}
									})
								},
								error: function(err){
									alert('You entered the wrong password. Please log in')
									window.location.href = windowURL + '/login'
								}
							})
						}
					})
				}
			})
		}

	})
}


$(() => {
	validateForm()
	displayError()
	changeEmail()
})