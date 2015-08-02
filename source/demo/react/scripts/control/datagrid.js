var DefaultDataGrid = React.createClass({displayName: "DefaultDataGrid",
  propTypes: {
    dataSource: React.PropTypes.func.isRequired,
    columns: React.PropTypes.array.isRequired,
    itemKey: React.PropTypes.string,
    specialColumnRenders: React.PropTypes.object
  },
  getDefaultProps: function(){
    return {
      itemKey: 'sid',
      specialColumnRenders: {}
    };
  },
  render: function(){
    console.debug("render DefaultDataGrid");
    //console.debug(this.props);
    return (
      React.createElement(DataGrid, {dataSource: this.props.dataSource, columns: this.props.columns, 
        getItemKey: this.getItemKey, getColumnKey: this.getColumnKey, 
        getHeadView: this.getHeadView, getColumnText: this.getColumnText, getCellView: this.getCellView, 
        searchableColumns: this.getSearchableColumns(), sortableColumns: this.getSortableColumns()})
    );
  },
  getSearchableColumns: function(){
    return this.props.columns.filter(function(column){
      return column.searchable;
    });
  },
  getSortableColumns: function(){
    return this.props.columns.filter(function(column){
      return column.sortable;
    });
  },
  getItemKey: function(item){
    return item[this.props.itemKey];
  },
  getColumnKey: function(column){
    return column.name;
  },
  getHeadView: function(column){
    return (React.createElement("span", null, column.title || column.name));
  },
  getColumnText: function(column){
    return column.title || column.name;
  },
  getCellView: function(item,column){
    var render = this.props.specialColumnRenders[column.name];
    if(render){
      return render(item[column.name],item,column);
    }else{
      return (React.createElement("span", null, String(item[column.name])));
    }
  }
});

var DataGrid = React.createClass({displayName: "DataGrid",
  getInitialState: function(){
    return {
      shownColumns: [],
      filter: {
        key: '',
        filterColumn: '',
        orderbyColumn: '',
        desc: false
      }
    };
  },
  propTypes: {
    dataSource: React.PropTypes.func.isRequired,
    columns: React.PropTypes.array.isRequired,
    getItemKey: React.PropTypes.func.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getHeadView: React.PropTypes.func.isRequired,
    getColumnText: React.PropTypes.func.isRequired,
    getCellView: React.PropTypes.func.isRequired,
    searchableColumns: React.PropTypes.array,
    sortableColumns: React.PropTypes.array
  },
  componentWillMount: function(){
    this.setState({shownColumns: this.props.columns});
  },
  render: function(){
    console.debug("render DataGrid");
    //console.debug(this.props);
    return (
      React.createElement("div", {className: "data-grid"}, 
        React.createElement(DataViewer, {dataSource: this.props.dataSource, filter: this.state.filter, 
          pageSize: this.state.filter.pageSize, viewFactory: this.renderPagingView})
      )
    );
  },
  renderPagingView: function(props){
    return (
      React.createElement(PagingView, React.__spread({},  props, 
        {viewFactory: this.renderInternalView, 
        paginationViewFactory: this.renderControlPanelView})
      ));
  },
  renderInternalView: function(props){
    return (
      React.createElement(Table, React.__spread({},  props, {getItemKey: this.props.getItemKey, 
        columns: this.state.shownColumns, 
        getColumnKey: this.props.getColumnKey, 
        getHeadView: this.renderColumnHead, 
        getCellView: this.props.getCellView})
      ));
  },
  renderColumnHead: function(column){
    var dragProps = {
      draggable: true,
      onColumnDrag: this.onColumnDrag,
      onColumnDragOver: this.onColumnDragOver,
      onColumnDrop: this.onColumnDrop
    };
    return (
      React.createElement(DataGrid.ColumnHead, React.__spread({currentColumn: column},  dragProps, 
        {shownColumns: this.state.shownColumns, 
        columns: this.props.columns, 
        getColumnKey: this.props.getColumnKey, 
        getHeadView: this.props.getHeadView, 
        getColumnText: this.props.getColumnText, 
        onShownColumnsChange: this.changeShownColumns, 
        onFilterChange: this.onFilterChange, 
        filter: this.state.filter, 
        sortable: this.props.sortableColumns && _.any(this.props.sortableColumns,column)})
      ));
  },
  renderControlPanelView: function(props){
    return (
      React.createElement(DataGrid.ControlPanel, {filter: this.state.filter, 
        paginationProps: props, 
        searchableColumns: this.props.searchableColumns, 
        getColumnKey: this.props.getColumnKey, 
        getColumnText: this.props.getColumnText, 
        onFilterChange: this.onFilterChange}
      ));
  },
  changeShownColumns: function(newShownColumns){
    this.setState({shownColumns: newShownColumns});
  },
  onFilterChange: function(newFilter){
    this.setState({filter: _.merge(this.state.filter, newFilter)});
  },
  onColumnDrag: function(columnHead){
    this.currentDraggedColumn = columnHead.props.currentColumn;
  },
  onColumnDragOver: function(columnHead,e){
    if(!this.currentDraggedColumn) return;
    e.preventDefault();
  },
  onColumnDrop: function(columnHead){
    if(!this.currentDraggedColumn) return;
    this.exchangeColumnSequences(this.currentDraggedColumn, columnHead.props.currentColumn);
  },
  exchangeColumnSequences: function(fromColumn, toColumn){
    var i,j,columns = _.union(this.state.shownColumns,[]);
    for(var k = 0;k < columns.length;k++){
      var col = columns[k];
      if(col == fromColumn){
        i = k;
      }else if(col == toColumn){
        j = k;
      }
    }
    console.debug("adjust column sequence from " + i + " to " + j);
    if(i < j){
      for(var k = i;k<j;k++){
        var temp = columns[k];
        columns[k] = columns[k+1];
        columns[k+1] = temp;
      }
    }else{
      for(var k = i;k>j;k--){
        var temp = columns[k];
        columns[k] = columns[k-1];
        columns[k-1] = temp;
      }
    }
    delete this.currentDraggedColumn;
    this.setState({shownColumns: columns});
  }
});

DataGrid.ColumnHead = React.createClass({displayName: "ColumnHead",
  propTypes: {
    currentColumn: React.PropTypes.any.isRequired,
    shownColumns: React.PropTypes.array.isRequired,
    columns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getHeadView: React.PropTypes.func.isRequired,
    getColumnText: React.PropTypes.func.isRequired,
    onShownColumnsChange: React.PropTypes.func.isRequired,
    draggable: React.PropTypes.bool,
    onColumnDrag: React.PropTypes.func.isRequired,
    onColumnDragOver: React.PropTypes.func.isRequired,
    onColumnDrop: React.PropTypes.func.isRequired,
    sortable: React.PropTypes.bool.isRequired,
    filter: React.PropTypes.object.isRequired,
    onFilterChange: React.PropTypes.func.isRequired
  },
  render: function(){
    var dragProps = {};
    if(this.props.draggable){
      dragProps = {
        draggable: true,
        onDrag: this.onDrag,
        onDragOver: this.onDragOver,
        onDrop: this.onDrop
      };
    }
    var sortClasses = React.addons.classSet({
      title: true,
      sortable: this.props.sortable,
      up: this.isSorting() && !this.props.filter.desc,
      down: this.isSorting() && this.props.filter.desc
    });
    return (
      React.createElement("div", React.__spread({className: "column-head"},  dragProps), 
        React.createElement(DataGrid.ColumnSelectPanel, {
          currentColumn: this.props.currentColumn, 
          shownColumns: this.props.shownColumns, 
          columns: this.props.columns, 
          getColumnKey: this.props.getColumnKey, 
          getColumnText: this.props.getColumnText, 
          onShownColumnsChange: this.props.onShownColumnsChange}
        ), 
        React.createElement("div", {className: sortClasses, onClick: this.props.sortable ? this.onSort : null}, 
          this.props.getHeadView(this.props.currentColumn)
        )
      )
    );
  },
  isSorting: function(){
    return this.props.filter.orderbyColumn == this.props.getColumnKey(this.props.currentColumn);
  },
  onSort: function(){
    this.props.onFilterChange({
      orderbyColumn: this.props.getColumnKey(this.props.currentColumn),
      desc: this.isSorting() ? !this.props.filter.desc : this.props.filter.desc
    });
  },
  onDrag: function(e){
    e.dataTransfer.setDragImage(this.getDOMNode(),0,0);
    this.props.onColumnDrag(this,e);
  },
  onDragOver: function(e){
    this.props.onColumnDragOver(this,e);
  },
  onDrop: function(e){
    this.props.onColumnDrop(this,e);
  }
});

DataGrid.ColumnSelectPanel = React.createClass({displayName: "ColumnSelectPanel",
  getInitialState: function(){
    return {
      showList: false
    };
  },
  propTypes: {
    currentColumn: React.PropTypes.any.isRequired,
    shownColumns: React.PropTypes.array.isRequired,
    columns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getColumnText: React.PropTypes.func.isRequired,
    onShownColumnsChange: React.PropTypes.func.isRequired
  },
  render: function(){
    var listView;
    if(this.state.showList){
      listView = (
        React.createElement(List, {items: this.props.columns, 
          selection: this.props.shownColumns, 
          getItemKey: this.props.getColumnKey, 
          getItemView: this.renderOption, 
          onSelectionChange: this.onShownColumnsChange})
      );
    }
    var columnSelectClasses = React.addons.classSet({
      'column-select': true,
      'expanded': this.state.showList
    });
    return (
      React.createElement("div", {className: columnSelectClasses}, 
        React.createElement("button", {className: "toggle", onClick: this.onToggleShowList}, "."), 
        listView
      )
    );
  },
  onShownColumnsChange: function(newSelection){
    this.props.onShownColumnsChange(newSelection);
    this.setState({showList: false});
  },
  renderOption: function(column,args){
    return (React.createElement("span", null, this.props.getColumnText(column)));
  },
  onToggleShowList: function(){
    this.setState({showList: !this.state.showList});
  }
});

DataGrid.ControlPanel = React.createClass({displayName: "ControlPanel",
  getInitialState: function(){
    return {
      showFilterPanel: false
    };
  },
  propTypes: {
    filter: React.PropTypes.object.isRequired,
    onFilterChange: React.PropTypes.func.isRequired,
    searchableColumns: React.PropTypes.array,
    getColumnKey: React.PropTypes.func.isRequired,
    getColumnText: React.PropTypes.func.isRequired,
    paginationProps: React.PropTypes.object.isRequired
  },
  render: function(){
    console.debug("render DataGrid.ControlPanel");
    console.debug(this.state);
    var filterPanel;
    if(this.state.showFilterPanel && this.props.searchableColumns && this.props.searchableColumns.length > 0){
      filterPanel = (React.createElement(DataGrid.FilterPanel, React.__spread({key: "filterPanel"},  this.props)));
    }
    return (
      React.createElement("div", {className: "control-panel"}, 
        React.createElement(React.addons.CSSTransitionGroup, {transitionName: "filter-panel"}, 
          filterPanel
        ), 
        React.createElement("div", {className: "pagination-panel"}, 
          React.createElement("button", {onClick: this.onToggleShowFilterPanel, className: "search"}, "."), 
          React.createElement("span", null, "Search"), 
          React.createElement(DataGrid.Pagination, React.__spread({},  this.props.paginationProps)), 
          React.createElement(DataGrid.Summary, React.__spread({},  this.props.paginationProps))
        )
      )
    );
  },
  onToggleShowFilterPanel: function(){
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }
});

DataGrid.FilterPanel = React.createClass({displayName: "FilterPanel",
  propTypes: {
    filter: React.PropTypes.object.isRequired,
    onFilterChange: React.PropTypes.func.isRequired,
    searchableColumns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getColumnText: React.PropTypes.func.isRequired,
  },
  render: function(){
    var alternativeOptions = this.props.searchableColumns.map(function(column){
      var columnKey = this.props.getColumnKey(column);
      return (React.createElement("option", {key: columnKey, value: columnKey}, this.props.getColumnText(column)));
    }.bind(this));
    return (
      React.createElement("div", {className: "filter-panel"}, 
        React.createElement("div", {className: "wrapper"}, 
          React.createElement("span", null, "Find"), 
          React.createElement(ThrottledInput, {value: this.props.filter.key, onChange: this.onFilterKeyChange}), 
          React.createElement("select", {value: this.getFilterColumn(), onChange: this.onFilterColumnChange}, 
            alternativeOptions
          )
        )
      )
    );
  },
  getFilterColumn: function(){
    return this.props.filter.filterColumn || this.props.getColumnKey(this.props.searchableColumns[0]);
  },
  onFilterKeyChange: function(value){
    this.props.onFilterChange(_.merge(this.props.filter,{
      key: value,
      filterColumn: this.getFilterColumn()
    }));
  },
  onFilterColumnChange: function(e){
    this.props.onFilterChange(_.merge(this.props.filter,{filterColumn: e.target.value}));
  }
});

DataGrid.Pagination = React.createClass({displayName: "Pagination",
  propTypes: {
    pageIndex: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    totalCount: React.PropTypes.number.isRequired,
    onNextPage: React.PropTypes.func.isRequired
  },
  render: function(){
    console.debug("render DataGrid.Pagination");
    //console.debug(this.props);
    return (
      React.createElement("span", {className: "pagination-view"}, 
        React.createElement("button", {className: "first", onClick: this.onFirstPage}, '<<'), 
        React.createElement("button", {className: "previous", onClick: this.onPreviousPage}, '<'), 
        React.createElement("span", null, "Page"), 
        React.createElement(ThrottledInput, {onChange: this.onInputPageNumber, value: (this.props.pageIndex+1).toString()}), 
        React.createElement("span", null, "of ", this.totalPage()), 
        React.createElement("button", {className: "next", onClick: this.onNextPage}, '>'), 
        React.createElement("button", {className: "last", onClick: this.onLastPage}, '>>'), 
        React.createElement("button", {className: "refresh", onClick: this.onRefresh}, ".")
      )
    );
  },
  totalPage: function(){
    return Math.ceil(this.props.totalCount/this.props.pageSize);
  },
  onFirstPage: function(){
    this.props.onNextPage(0);
  },
  onPreviousPage: function(){
    if(this.props.pageIndex - 1 >= 0)
      this.props.onNextPage(this.props.pageIndex - 1);
  },
  onNextPage: function(){
    if(this.props.pageIndex + 1 <= this.totalPage() - 1)
      this.props.onNextPage(this.props.pageIndex + 1);
  },
  onLastPage: function(){
    this.props.onNextPage(this.totalPage()-1);
  },
  onRefresh: function(){
    this.props.onNextPage(this.props.pageIndex);
  },
  onInputPageNumber: function(value){
    console.debug("on input page number="+value);
    var pageIndex = parseInt(value)-1;
    if(pageIndex >= 0 && pageIndex < this.totalPage())
      this.props.onNextPage(pageIndex);
  }
});

DataGrid.Summary = React.createClass({displayName: "Summary",
  propTypes: {
    pageIndex: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    totalCount: React.PropTypes.number.isRequired
  },
  render: function(){
    var i = this.props.pageIndex, s = this.props.pageSize, c = this.props.totalCount;
    return (
      React.createElement("span", {className: "summary"}, "Displaying ", i*s + 1, " to ", Math.min((i+1)*s,c), " of ", c, " items")
    );
  }
});
