const windowURL = window.location.origin

function formatError(){
	let elementArray = ['#firstName', '#lastName', '#email', '#password', '#confirmPassword']
	
	let errorCount = 0,
		filledCount = 0
		
		elementArray.forEach(element => {
			
			if($(element).val() !== ""){
				filledCount++
			}

			if ($(element).hasClass('error')){
					let failureHtml =   
						  `<span class="glyphicon glyphicon-remove form-control-feedback feedback error" aria-hidden="true"></span>` +
						  `<span id="inputError2Status" class="sr-only feedback">(error)</span>`

					let parent = $(element).parent()
					$(element).removeClass('valid')
					$(parent).children('.feedback').remove()
					$(parent).removeClass('has-success').addClass('has-danger')
					$(parent).append(failureHtml)  
					$('#registerButton').prop('disabled', true)
					errorCount++
			}
		})

		if(errorCount == 0 && filledCount === 5){
			$('#registerButton').prop('disabled', false)
		} 
}

function displayError(){
	$('input').on('keydown', () => {
		setTimeout(formatError, 100)
	})

	$('input').on('focusout', () => {
		setTimeout(formatError, 100)
	})
}

function validateForm(){
	$('#registerForm').validate({
		rules: {
			firstName: "required",
			lastName: "required",
			password: {
				required: true,
				minlength: 8
			},
			confirmPassword: {
				equalTo: "#password"
			},
			email: {
				required: true,
				email: true,
			},

		},

		// changes success messages
		success: function(label){
    		let successHtml =   
	    		`<span class="glyphicon glyphicon-ok form-control-feedback feedback" aria-hidden="true"></span>` +
	  			`<span id="inputSuccess2Status" class="sr-only feedback">(success)</span>`

    		if (label[0].htmlFor === 'email'){
			    
			    let data = {
					email: $('#email').val()
				}

					//this provides immediate feedback to users about whether email has already been taken
				$.ajax({
					type: 'post',
					url: windowURL + '/users/email',
					data: JSON.stringify(data),
					contentType: 'application/json',
					success: function(data){
						if (data.message === 'Email has already been used to create an account'){
							   let parent = $('#email').parent()
			    				$(parent).removeClass('has-success')
			    				$(parent).children('.feedback').remove()

								$('#email').removeClass('valid').addClass('error')
								$('#email-error').text(data.message)
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
			password: "Please enter a password of at least 8 characters",
			confirmPassword: "Please enter a matching password"
		}
	})	         
}

function register(){
	$("#registerButton").on('click', (event) => {

		event.preventDefault()


		let user = {} 
		
			//serializes array into object
			//adds firstName and lastName keys to user object
			//to meet database expectations for user field
		let userData = $('#registerForm').serializeArray().reduce((obj, item) => {
   		 if(item.name === "firstName" || item.name === "lastName"){
   		 	user[item.name] = item.value
   		 }
   		 else if (item.name !== 'confirmPassword'){
   		 	obj[item.name] = item.value
   		 }
   		 obj["user"] = user
   		 return obj;
		}, {});


		$.ajax({
			type: 'post',
			url: windowURL + '/users',
			data: JSON.stringify(userData),
			contentType: 'application/json', 
			success: function(data){
				
				let signInData = {
					email: userData.email,
					password: userData.password
				}
					//automatically signs in user on successful register
				$.ajax({
					type: 'post',
					url: windowURL + '/login',
					data: JSON.stringify(signInData),
					contentType: 'application/json',
					success: function(data){
						window.location.href = windowURL + data.redirect
					}
				})


			}
		})

	})
}


$(() => {
	validateForm()
	displayError()
	register()
})