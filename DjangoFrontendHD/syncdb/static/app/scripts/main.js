var working = false;
var events;
var scope = undefined;
var _sending_request = false;

//Get Recent Setup
var RecentInterval = 5000,
	GenDataInterval = 3*RecentInterval,
	RecentMax = 30,
	LastKnownId = "_none_",
	GenDataSend = {"gen_count":1000},
	DataSend = {"max_events":RecentMax,"last_known_id":LastKnownId};


var GenDataRequest = null, GetRecentRequest = null;
var GenDataButton = null, GetRecentButton = null;





function ButtonToggler(Target, InitialState, OnDisable, OnEnable, InitialUpdate, DisabledHTML, EnabledHTML, Data) {
	var __enabled = false;


	this.EnabledHTML = EnabledHTML;
	this.DisabledHTML = DisabledHTML;
	this.OnEnable = OnEnable;
	this.OnDisable = OnDisable;
	this.Target = Target;
	this.Data = (Data!=null&&Data!=undefined)?Data:null

	function __init__(o, target){
		if(InitialUpdate) {
			__enabled = !InitialState;
			o.toggle();
		}
		else
			__enabled = InitialState;

		$(target).click(function (){
			o.toggle();
		});

	}


	this.toggle = function toggle(){
			if(__enabled)
				this.disable();
			else
				this.enable();
		};

	this.enable = function enable(){
		if(!__enabled){
			if(this.EnabledHTML!=undefined && this.EnabledHTML!=null)
				$(this.Target).html(this.EnabledHTML);
			this.OnEnable(this);
		}
		__enabled = !__enabled;
	};

	this.disable = function disable(){
		if(__enabled){
			if(this.DisabledHTML!=undefined && this.DisabledHTML!=null)
				$(this.Target).html(this.DisabledHTML);
			this.OnDisable(this);
		}
		__enabled = !__enabled;
	};

	__init__(this, this.Target);

}

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
				console.log(json);
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
	var __timer = EnableTimer?setInterval(function(){ obj.send.call(obj) }, TimerInterval):null;
	var __csrf = csrftoken = $.cookie('csrftoken');

	this.start = function start() {
		if(__timer == null) {
			obj = this;
			__timer = setInterval(function() {obj.send.call(obj); }, this.TimerInterval);

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


//CHECK IF METHOD IS CSRF COOKIE FREE
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

function LoadEventInfo(tar){



}

///MAIN FUNCTION
$(document).ready( function(){

	GetRecentRequest = new AJAXRequest("api/get_recent", null, function (tar, json){
		DataSend.last_known_id = json.last_known_id;
		AppendEventData(json.data);
		
	}, null, DataSend, RecentInterval, false, true);
	GetRecentButton = new ButtonToggler($("#sync_db_button"),true,
		function() {
			GetRecentRequest.stop.call(GetRecentRequest);
		},
		function(){
			GetRecentRequest.start.call(GetRecentRequest);
		},true,"Start Sync","Stop Sync",null);

	GenDataRequest = new AJAXRequest('api/gen_data',null,
		function(tar, json) {

		}, null, GenDataSend, GenDataInterval, false, true);
	GenDataButton = new ButtonToggler("#gen_db_button",false,
	function(){
		var s = $(GenDataButton.Target).html().replace("Stop","Start");
		$(GenDataButton.Target).empty().append(s);
		GenDataRequest.stop.call(GenDataRequest);
	},
	function(){
		var s = $(GenDataButton.Target).html().replace("Start","Stop");
		$(GenDataButton.Target).empty().append(s);
		GenDataRequest.start.call(GenDataRequest);
	}, false, null, null, null);
	//we will make togllable button's tooltip
	$('[data-toggle="tooltip"]').tooltip();
});




angular.module('RedisSync', [])
	.controller('RedisDbSyncSetup', function($scope) {
		$scope.events = [{"type": "a", "sid": 197718341090436080329598542453518625507, "uid": 89982298614867403075834338541199092940, "desc": "Just some random text #41"}];
		events = $scope.events;
		scope = $scope;

	});



