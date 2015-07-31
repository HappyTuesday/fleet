var FakeDB = function(){
  this.userTable = _.range(1,1000).map(function(i){
    return {
      sid: i,
      name: "nick-"+i
    };
  });
}

FakeDB.prototype.userDataSource = function(filter,callback){
  console.debug("user-table is visited");
  var matchedRows = this.userTable.filter(function(row){
    return row.name.indexOf(filter.key) >= 0;
  });
  var returnedRows = matchedRows.slice(filter.pageIndex*filter.pageSize,(filter.pageIndex+1)*filter.pageSize);
  //console.debug(filter);
  //console.debug(returnedRows);
  setTimeout(function(){
    callback({
      data: returnedRows,
      totalCount: matchedRows.length
    });
  },1000);
}

var App = React.createClass({displayName: "App",
  db: new FakeDB(),
  render: function(){
    return (
      React.createElement("div", null, 
        React.createElement("h2", null, "Here is the demo for auto-complate control"), 
        React.createElement(AutoCompleteWithPopup, {dataSource: this.dataSource, getItemKey: this.getUserKey, getItemView: this.getUserView, getItemFilter: this.getUserFilter})
      )
    );
  },
  getUserKey: function(user){
    return user.sid;
  },
  getUserView: function(user){
    return (React.createElement("span", null, user.name));
  },
  getUserFilter: function(user,filter){
    return user.name.indexOf(filter.key) >= 0;
  },
  dataSource: function(filter,callback){
    this.db.userDataSource(filter,callback);
  }
});

var app = React.render(
  React.createElement(App, null),
  document.getElementById('content')
);
