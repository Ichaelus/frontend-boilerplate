console.log("Frontend started..");
let stateView,
	stateData = {
	};

try{
	runGenerator(function *main(){
		initVue();
    $("#page").fadeIn();
    $('[data-toggle="tooltip"]').tooltip();
	});
}catch(ex){
	console.log(ex);
}

function initVue(){
  // Init Vue components (state, input, classifiers, output)
  assert(typeof(Vue) != "undefined", "Vue script missing");
  stateView = new Vue({
    el: '#header',
    data: stateData,
    methods:{
    },
    computed:{

    }
  });
}


/* HELPER FUNCTIONS */

function wait_async(time){
  // Wait asynchronously, like sleep(time)
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve();
    }, time);
  });
}

function jQGetPromise(url, datatype = ""){
  // Promise for $.get 
  assert(isNotEmpty(url), "URL missing");
  return new Promise(function(resolve, reject){
    $.get(url, function(data){resolve(data)},datatype)
    .fail(function(data){
      reject("Error getting data from url " + url);
    });
  }).then(function(data){
    return data;
  });
}

function runGenerator(g) {
  //A simple ES6 runGenerator, handling tasks
  var it = g(), ret;
  var result = it.next();
  // asynchronously iterate over generator
  (function iterate(val){
    if (!result.done) {
      // poor man's "is it a promise?" test
      if ("then" in result.value) {                
        // resolve to a promise to make it easy
        let promise = Promise.resolve(result.value);
        promise.then(function(value) {
          result = it.next(value);
          iterate();
        }).catch(function(error) {
          console.log("Generator caught an error: " + error);
          result = it.next(null);//it.throw("Generator caught an error: " + error);
          iterate();
        });
      }
      // immediate value: just send right bk in
      else {
        // avoid synchronous recursion
        setTimeout( function(){
          iterate( result.value );
        }, 0 );
      }
    }
  })();
}

function assert(condition, message) {
  // Throw error if condition is not true  
  if (!condition) {
      message = message || "Assertion failed";
      if (typeof Error !== "undefined") {
          throw new Error(message);
      }
      throw message; // Fallback
  }
}

function isNotEmpty(str){
  // Checks if str is not empty and not null
  return !isEmpty(str);
}

function isEmpty(str) {
  // Checks if str is empty or null
  return (!str || 0 === str.length);
}

function notify(title, note, duration = 1000){
  //Prompts a browser notification and/or requests permission to do
  var got_permission = false;
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      got_permission = true;
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission((permission) => {
        if (permission === "granted")
          got_permission = true;
      });
    }
  }
  if(got_permission){
      title = title === "" ? getString('notif_title') : title;
      let options = {
          body: note,
          icon: '/images/sheep_logo.png',
      };
      let notification = new Notification(title, options);
      setTimeout(notification.close.bind(notification), duration); 
  }
}


function trimRight(str, charlist) {
  // Trims specific chars from the right side of a string
  if (charlist === undefined)
    charlist = "\s";
  return str.replace(new RegExp("[" + charlist + "]+$"), "");
};