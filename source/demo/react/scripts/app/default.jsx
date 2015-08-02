var FakeDB = function(){
  this.userTable = _.range(1,1000).map(function(i){
    return {
      sid: i,
      name: "nick-"+i
    };
  });
  this.vehicleTypes = [
    'normal',
    'big',
    'small',
    'others'
  ];
  this.vehicleTable = _.range(1,1000).map(function(i){
    return {
      sid: i,
      vehicleID: "veh-"+i,
      vim: Math.round(Math.random()*10000),
      type: this.vehicleTypes[(i-1) % this.vehicleTypes.length],
      enabled: i % 5 != 0,
      modifiedDate: new Date()
    };
  }.bind(this));
}

FakeDB.prototype.userDataSource = function(filter,callback){
  console.debug("user-table is visited");
  var matchedRows = this.userTable.filter(function(row){
    return row.name.indexOf(filter.key) >= 0;
  });
  var returnedRows = matchedRows.slice(filter.pageIndex*filter.pageSize,(filter.pageIndex+1)*filter.pageSize);
  setTimeout(function(){
    callback({
      data: returnedRows,
      totalCount: matchedRows.length
    });
  },1000);
}

FakeDB.prototype.vehicleDataSource = function(filter,callback){
  console.debug("vehicle-table is visited");
  console.debug(filter);
  var matchedRows;
  if(filter.filterColumn){
    matchedRows = this.vehicleTable.filter(function(row){
      return row[filter.filterColumn].indexOf(filter.key) >= 0;
    });
  }else{
    matchedRows = this.vehicleTable;
  }
  if(filter.orderbyColumn){
    var matchedRows = _.orderby(matchedRows,function(row){
      return row[filter.orderbyColumn];
    },filter.desc);
  }
  var returnedRows = matchedRows.slice(filter.pageIndex*filter.pageSize,(filter.pageIndex+1)*filter.pageSize);
  setTimeout(function(){
    callback({
      data: returnedRows,
      totalCount: matchedRows.length
    });
  },1000);
}

var App = React.createClass({
  db: new FakeDB(),
  render: function(){
    return (
      <div className="app">
        <div className="demo">
          <h2>Here is the demo for auto-complate control</h2>
          <AutoCompleteWithPopup dataSource={this.userDataSource} getItemKey={this.getUserKey} getItemView={this.getUserView} getItemFilter={this.getUserFilter} />
        </div>
        <div className="demo">
          <h2>Here is the demo for datagrid control</h2>
          <DefaultDataGrid dataSource={this.vehicleDataSource}
            columns={this.vehicleColumns}
            specialColumnRenders={{modifiedDate: this.renderDate}} />
        </div>
      </div>
    );
  },
  getUserKey: function(user){
    return user.sid;
  },
  getUserView: function(user){
    return (<span>{user.name}</span>);
  },
  getUserFilter: function(user,filter){
    return user.name.indexOf(filter.key) >= 0;
  },
  renderDate: function(date){
    return <span>{date.toDateString()}</span>;
  },
  userDataSource: function(filter,callback){
    return this.db.userDataSource(filter,callback);
  },
  vehicleDataSource: function(filter,callback){
    return this.db.vehicleDataSource(filter,callback);
  },
  vehicleColumns: [
    {name: 'sid', title: 'SID', sortable: true},
    {name: 'vehicleID', title: 'Vehicle ID', sortable: true, searchable: true},
    {name: 'vim', title: 'VIM', sortable: true},
    {name: 'type', title: 'Type', sortable: true, searchable: true},
    {name: 'enabled', title: 'Enabled', sortable: true},
    {name: 'modifiedDate', title: 'Modified Date', sortable: true}
  ]
});

var app = React.render(
  <App />,
  document.getElementById('content')
);
