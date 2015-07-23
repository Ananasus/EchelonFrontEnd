var intervaled_timer;
var csrftoken;
var working = false;
var last_known_id = "_none_";
var events;
var scope = undefined;
var _sending_request = false;
//ANGULARJS Controllers



function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function AppendEventData(data){
	for(i in data){
		obj = jQuery.parseJSON(data[i]);
		events.push(obj);
	}
	//update bindings
	scope.$digest();
}

function SendRequest(){

	if(_sending_request == false) {
		console.log("Sending request...");
		_sending_request = true;
		$.ajax({
			url : "get_recent/", // the endpoint
			type : "POST", // http method
			data : JSON.stringify({ 'last_known_id':last_known_id }), // data sent with the post request
			dataType: "json",
			// handle a successful response
			success : function(json) {
				last_known_id = json.last_known_id;
				if(json.data.length > 0) {
					AppendEventData(json.data);
				}

				console.log(json); // log the returned json to the console
				console.log("success"); // another sanity check
				_sending_request = false;
			},

			// handle a non-successful response
			error : function(xhr,errmsg,err) {
				var el = $('#table_content').append("<div class='alert-box alert radius' data-alert id='error_msg_django_redis'>Oops! We have encountered an error: "+errmsg+"   "+err+
					" <span class='close'>&times;</span></div>");
				$('.close',el).click(
					function(){
						$(this).parent().remove();

					}
				);
				_sending_request = false;
				console.log('OLOLOLO: '+err); // provide a bit more info about the error to the console
			}
		})

	}
	else
		console.warn("[WARN] Request Already Sent. Waiting for response...");

}


function ToggleSyncing(object){
	if(object == undefined)
		object = this;
	if(working) {
		$(object).html('Start Sync');
		window.clearInterval(intervaled_timer);
	}
	else {
		intervaled_timer = setInterval(function() { SendRequest() },5000);
		$(object).html('Stop Sync');
	}
	working = !working;
}

function ToggleSyncingClick(){
	ToggleSyncing(this);
}
///MAIN FUNCTION
$(document).ready( function(){
	csrftoken = $.cookie('csrftoken');
	$.ajaxSetup({
    	beforeSend: function(xhr, settings) {
        	if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            	xhr.setRequestHeader("X-CSRFToken", csrftoken);
        	}
    	}
	});
	var btn = $('#sync_db_button');
	ToggleSyncing(btn);
	btn.click(ToggleSyncingClick)

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
angular.module('RedisSync', [])
	.controller('RedisDbSyncSetup', function($scope) {
		$scope.events = [{"alert_class": "a", "sid": 197718341090436080329598542453518625507, "uid": 89982298614867403075834338541199092940, "description": "Just some random text #41"}];
		events = $scope.events;
		scope = $scope;
		$scope.users = [
			{
				name:"Mahesh",
				description:"A geek",
				age:"22"
			},
			{
				name:"Ganesh",
				description:"A nerd",
				age:"25"
			},
			{
				name:"Ramesh",
				description:"A noob",
				age:"27"
			},
			{
				name:"Ketan",
				description:"A psychopath",
				age:"26"
			},
			{
				name:"Niraj",
				description:"Intellectual badass",
				age:"29"
			}
		];
	});



