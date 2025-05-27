/*
 * Copyright 2006-2023 Medstrat, Inc. All rights reserved.
 * Copyright 2024-2025 Zimmer, Inc. All rights reserved.
 * See the accompanying AUTHORS file for a complete list of authors.
 * This file is subject to the terms and conditions defined in LICENSE.txt
 */

function getGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  })
}


// -----------
// IdleHandler
// -----------

var HEARTBEAT_PERIOD = 5  * 1000 * 60;
var IDLECHECK_PERIOD = 1  * 1000 * 60;

IdleHandler.prototype   = new Object();
IdleHandler.constructor = IdleHandler;


IdleHandler.create = function(callback) {
  new IdleHandler(IdleHandler.idleTimeout, callback);
}

window.IdleHandler = IdleHandler;

const idleTimeout = document.querySelector("#idleHandlerTimeout");

if (idleTimeout != null) {
    IdleHandler.idleTimeout = idleTimeout.dataset.timeout;
}
else {
    Console.log("Idle Handler Timeout not found. Using default value of 60 minutes.");
    IdleHandler.idleTimeout = 60;
}


function IdleHandler(idleTimeout, callback) {
  var self = this;
  
  self.init(idleTimeout, callback);
  self.runHeartbeat();
  self.runIdleCheck();
  
  idle({
    onIdle: function() {
      self.isIdle = true;

      self.update();
    },

    onActive: function() {
      self.isIdle = false;

      self.update();
    },

    idle: self.idleDelay
  }).start();
  
  // TODO: Add a second idle checker to show inactivity modal
  
  window.addEventListener('pagehide', function(event) {
    localStorage.removeItem(self.key);
  });
}


IdleHandler.prototype.init = function(idleTimeout, callback) {
  this.guid          = getGUID();
  this.key           = "idlehandler-" + this.guid;
  this.isIdle        = false;
  this.idleDelay     = idleTimeout * 60 * 1000;                                           // Convert minutes to milliseconds
  this.nearIdleDelay = ((idleTimeout > 1) ? (idleTimeout - 1) : idleTimeout) * 60 * 1000; // Give a 1 minute notification
  this.expiredDelay  = (idleTimeout + 10) * 60 * 1000;                                    // 10 minutes past the idle timeout
  this.callback      = callback;
}


IdleHandler.prototype.update = function() {
  var now   = new Date().getTime();
  var entry = {'isIdle' : this.isIdle, 'lastUpdated' : now};
  
  localStorage.setItem(this.key, JSON.stringify(entry));
}


IdleHandler.prototype.runHeartbeat = function() {
  this.update();
  
  setTimeout(this.runHeartbeat.bind(this), HEARTBEAT_PERIOD);
}


IdleHandler.prototype.runIdleCheck = function() {
  if (this.isIdle && this.isEveryoneIdle()) {
    this.callback();
  }
  
  setTimeout(this.runIdleCheck.bind(this), IDLECHECK_PERIOD);
}


IdleHandler.prototype.isEveryoneIdle = function() {
  var isEveryoneIdle = true;
  var now            = new Date().getTime();
  var expired        = [];
  
  for (var i = 0 ; i < localStorage.length ; i++) {
    var key = localStorage.key(i);
    
    if (key.indexOf("idlehandler-") == 0) {
      var entry = JSON.parse(localStorage.getItem(key));

      if (now - entry['lastUpdated'] > this.expiredDelay) {
        // Expired entry, tab may have crashed
        expired.push(key);
      }
      else if (!entry['isIdle']) {
        isEveryoneIdle = false;
        
        break;
      }
      else {
        // Do nothing
      }
    }
  }
  
  for (var i = 0; i < expired.length; i++) {
    localStorage.removeItem(expired[i]);
  }
  
  return isEveryoneIdle;
}
