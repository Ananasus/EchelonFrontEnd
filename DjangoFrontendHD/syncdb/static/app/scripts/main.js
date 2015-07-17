var intervaled_timer;
var csrftoken;


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function SendRequest(){
	console.log("Sending request...");
	$.ajax({
		url : "get_recent/", // the endpoint
		type : "POST", // http method
		data : { the_post : $('#post-text').val() }, // data sent with the post request

		// handle a successful response
		success : function(json) {
			$('#post-text').val(''); // remove the value from the input

			console.log(json); // log the returned json to the console
			console.log("success"); // another sanity check
		},

		// handle a non-successful response
		error : function(xhr,errmsg,err) {
			$('#table_content').html("<div class='alert-box alert radius' data-alert id='error_msg_django_redis'>Oops! We have encountered an error: "+errmsg+"   "+err+
				" <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
			console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
		}
	})
}

$(document).ready( function(){
	intervaled_timer = setInterval(function() { SendRequest() },5000);
	csrftoken = $.cookie('csrftoken');
	$.ajaxSetup({
    	beforeSend: function(xhr, settings) {
        	if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            	xhr.setRequestHeader("X-CSRFToken", csrftoken);
        	}
    	}
	});
	
});
//window.onfocus = function(){
//	if(intervaled_timer)
//		intervaled_timer.start();
//	console.log("Focus acquired");
//}
//window.onblur = function(){
//	clearInterval(intervaled_timer);
//	delete intervaled_timer;
//	console.log("Focus left");
//}