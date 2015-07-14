var intervaled_timer;

function SendRequest(){
	console.log("Sending request...");
	$.ajax({
		url : "sync_events/", // the endpoint
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
			$('#table_content').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
				" <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
			console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
		}
	})
}

$(document).ready( function(){
	intervaled_timer = setInterval(function() { SendRequest() },5000);
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