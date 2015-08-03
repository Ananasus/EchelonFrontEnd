var LoadAveragePublic = {
	scope:undefined,
	la:undefined,
	UpdateInterval:10000,
	GenDataInterval:30000,
	GenDataRequest:null,
	GenDataButton:null,
	GetLoadRequest:null,
	GetLoadButton:null
};


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
				var el = $('#error_table-content').append("<tr class='alert-box alert radius' data-alert id='error_msg_django_redis'>Oops! We have encountered an error: "+errmsg+"   "+err+
					" <span class='close'>&times;</span></tr>");
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

function UpdateLoadData(data){

	//update bindings
	scope.$digest();
}


///MAIN FUNCTION
$(document).ready( function(){

	LoadAveragePublic.GetLoadRequest = new AJAXRequest("api/get_load", null, function (tar, json){
		UpdateLoadData(json);
		
	}, null, null, LoadAveragePublic.UpdateInterval, false, true);
	LoadAveragePublic.GetLoadButton = new ButtonToggler($("#sync_load_button"),true,
		function() {
			LoadAveragePublic.GetLoadRequest.stop.call(LoadAveragePublic.GetLoadRequest);
		},
		function(){
			LoadAveragePublic.GetLoadRequest.start.call(LoadAveragePublic.GetLoadRequest);
		},true,"Start Sync","Stop Sync",null);

	LoadAveragePublic.GenDataRequest = new AJAXRequest('api/gen_load',null,
		function(tar, json) {

		}, null, null, LoadAveragePublic.GenDataInterval, false, true);

	LoadAveragePublic.GenDataButton = new ButtonToggler("#gen_load_button",false,
	function(){
		var s = $(LoadAveragePublic.GenDataButton.Target).html().replace("Stop","Start");
		$(LoadAveragePublic.GenDataButton.Target).empty().append(s);
		LoadAveragePublic.GenDataRequest.stop.call(LoadAveragePublic.GenDataRequest);
	},
	function(){
		var s = $(LoadAveragePublic.GenDataButton.Target).html().replace("Start","Stop");
		$(LoadAveragePublic.GenDataButton.Target).empty().append(s);
		LoadAveragePublic.GenDataRequest.start.call(LoadAveragePublic.GenDataRequest);
	}, false, null, null, null);
	//we will make togllable button's tooltip
	$('[data-toggle="tooltip"]').tooltip();
});




angular.module('RedisSync', [])
	.controller('RedisDbSyncSetup', function($scope) {
		$scope.loadaverage = {"cpload":0, "memloaded":0,"memtotal":0,"diskloaded":0,"disktotal":0,"diskread":0,"diskwrite":0,"connections":0 };
		LoadAveragePublic.scope = $scope;
		LoadAveragePublic.la = $scope.loadaverage;

	});



