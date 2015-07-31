var _ = function(){}

_.union = function(a,b){
  var result = [];
  for(var i in a){
    result[i] = a[i];
  }
  for(var i in b){
    if(result.indexOf(b[i]) < 0){
      result.push(b[i]);
    }
  }
  return result;
}

_.except = function(a,b){
  var result = [];
  for(var i in a){
    if(b.indexOf(a[i]) < 0){
      result.push(a[i]);
    }
  }
  return result;
}

_.orderby = function(a,fn,desc=false){
  var b = [];
  for(var i=0;i<a.length;i++){
    b[i] = a[i];
    var value = fn(b[i]);
    for(var j=i-1;j>=0;j--){
      if(desc ? value > fn(b[i]) : value < fn(b[i])){
        var t = b[i];
        b[i] = b[i+1];
        b[i+1] = t;
      }else{
        break;
      }
    }
  }
  return b;
}

_.range = function(start,count){
  var a =Array(count);
  for(var i=0;i<count;i++){
    a[i] = start + i;
  }
  return a;
}

_.merge = function(a,b){
  var result = {};
  for(var p in a){
    result[p] = a[p];
  }
  for(var p in b){
    result[p] = b[p];
  }
  return result;
}

_.bind = function(fn,obj,args){
  return function(){
    return fn(args);
  }.bind(obj);
}

_.any = function(array,obj){
  return array.indexOf(obj) >= 0;
}

function throttle(delay,fn){
  var context,args,timeout;

  var throttled = function(){
    context = this;
    args = arguments;

    if(!timeout){
      console.debug("throttle-set timer");
      timeout = setTimeout(function(){
        console.debug("throttle-timeout");
        fn.apply(context,args);
        timeout = undefined;
      },delay);
    }
  }

  throttled.cancel = function(){
    if(timeout){
      clearTimeout(timeout);
    }
  }

  return throttled;
}
