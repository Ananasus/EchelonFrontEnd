var intervaled_timer;
var csrftoken;
var working = false;
var events;
var scope = undefined;
var _sending_request = false;

//Get Recent Setup
var RecentInterval = 5000,
	RecentMax = 100,
	LastKnownId = "_none_",
	DataSend = {"max_events":RecentMax,"last_known_id":LastKnownId};


var GenDataRequest = null, GetRecentRequest = null;

//ANGULARJS Controllers



function AJAXRequest(Url, BeforeSendInject, OnReceiveInject, OnErrorInject, Data, TimerInterval, EnableTimer, WaitResponse) {


	function sendRequest(tar) {

		$.ajax({
			url : tar.Url, // the endpoint
			type : "POST", // http method
			data : JSON.stringify(tar.Data), // data sent with the post request
			dataType: "json",
			beforeSend: function(xhr, settings) {
				if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
					xhr.setRequestHeader("X-CSRFToken", __csrf);
				}
				__sent = true;
				if(tar.BeforeSendInject != null && tar.BeforeSendInject != undefined)
					tar.BeforeSendInject(this);
			},
			success: function(json){
				console.log("Receive response for url:\""+tar.Url+"\" successfully.");
				__sent = false;
				if(tar.OnReceiveInject != null && tar.OnReceiveInject != undefined)
					tar.OnReceiveInject(tar,json);
			},
			error: function(xhr,errmsg,err) {
				var el = $('#table_content').append("<div class='alert-box alert radius' data-alert id='error_msg_django_redis'>Oops! We have encountered an error: "+errmsg+"   "+err+
					" <span class='close'>&times;</span></div>");
				$('.close',el).click(
					function(){
						$(this).parent().remove();

					}
				);
				__sent = false;
				if(tar.OnErrorInject != null && tar.OnErrorInject != undefined)
					tar.OnErrorInject(this);
				console.log('Error occured on ajax request \"'+tar.Url+"\":"+errmsg+"\n"+err); // provide a bit more info about the error to the console
			}


		});
	}
	var __sent = false;

	this.send = function send( data ){
		if(!this.WaitResponse || ! __sent) {
			if(data != undefined)
				this.Data = data;
			sendRequest(this);
			return true;
		}
		console.warn("Request: \""+this.Url+"\" already sent.");
		return false;

	};

	var obj = this;
	var __timer = EnableTimer?setInterval(function(){ obj.send(); }, TimerInterval):null;
	var __csrf = csrftoken = $.cookie('csrftoken');

	this.start = function start() {
		if(__timer == null) {
			__timer = setInterval(function() {this.send(); }, this.TimerInterval);

		}
	};
	this.stop = function stop() {
		if(__timer != null) {
			window.clearInterval(__timer);
			__timer = null;
		}
	};


	this.Data = Data;
	this.Url = Url;
	this.WaitResponse = WaitResponse;
	this.TimerInterval = TimerInterval;
	this.OnReceiveInject = OnReceiveInject;
	this.BeforeSendInject = BeforeSendInject;
	this.OnErrorInject = OnErrorInject;
};


ButtonController = new function(ButtonTarget, InitialState, OnEnable, OnDisable){

}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function AppendEventData(data){
	for(i in data){
		obj = jQuery.parseJSON(data[i]);
		events.unshift(obj);
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
	//csrftoken = $.cookie('csrftoken');
	//$.ajaxSetup({
    	//beforeSend: function(xhr, settings) {
     //   	if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
     //       	xhr.setRequestHeader("X-CSRFToken", csrftoken);
     //   	}
    	//}
	//});
	//var btn = $('#sync_db_button');
	//ToggleSyncing(btn);
	//btn.click(ToggleSyncingClick)

	GetRecentRequest = new AJAXRequest("api/get_recent", null, null, null, DataSend, RecentInterval, true, true);


});

angular.module('RedisSync', [])
	.controller('RedisDbSyncSetup', function($scope) {
		$scope.events = [{"type": "a", "sid": 197718341090436080329598542453518625507, "uid": 89982298614867403075834338541199092940, "desc": "Just some random text #41"}];
		events = $scope.events;
		scope = $scope;

	});



