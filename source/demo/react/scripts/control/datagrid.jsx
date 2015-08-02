var DefaultDataGrid = React.createClass({
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
      <DataGrid dataSource={this.props.dataSource} columns={this.props.columns}
        getItemKey={this.getItemKey} getColumnKey={this.getColumnKey}
        getHeadView={this.getHeadView} getColumnText={this.getColumnText} getCellView={this.getCellView}
        searchableColumns={this.getSearchableColumns()} sortableColumns={this.getSortableColumns()}/>
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
    return (<span>{column.title || column.name}</span>);
  },
  getColumnText: function(column){
    return column.title || column.name;
  },
  getCellView: function(item,column){
    var render = this.props.specialColumnRenders[column.name];
    if(render){
      return render(item[column.name],item,column);
    }else{
      return (<span>{String(item[column.name])}</span>);
    }
  }
});

var DataGrid = React.createClass({
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
      <div className="data-grid">
        <DataViewer dataSource={this.props.dataSource} filter={this.state.filter}
          pageSize={this.state.filter.pageSize} viewFactory={this.renderPagingView} />
      </div>
    );
  },
  renderPagingView: function(props){
    return (
      <PagingView {...props}
        viewFactory={this.renderInternalView}
        paginationViewFactory={this.renderControlPanelView}
      />);
  },
  renderInternalView: function(props){
    return (
      <Table {...props} getItemKey={this.props.getItemKey}
        columns={this.state.shownColumns}
        getColumnKey={this.props.getColumnKey}
        getHeadView={this.renderColumnHead}
        getCellView={this.props.getCellView}
      />);
  },
  renderColumnHead: function(column){
    var dragProps = {
      draggable: true,
      onColumnDrag: this.onColumnDrag,
      onColumnDragOver: this.onColumnDragOver,
      onColumnDrop: this.onColumnDrop
    };
    return (
      <DataGrid.ColumnHead currentColumn={column} {...dragProps}
        shownColumns={this.state.shownColumns}
        columns={this.props.columns}
        getColumnKey={this.props.getColumnKey}
        getHeadView={this.props.getHeadView}
        getColumnText={this.props.getColumnText}
        onShownColumnsChange={this.changeShownColumns}
        onFilterChange={this.onFilterChange}
        filter={this.state.filter}
        sortable={this.props.sortableColumns && _.any(this.props.sortableColumns,column)}
      />);
  },
  renderControlPanelView: function(props){
    return (
      <DataGrid.ControlPanel filter={this.state.filter}
        paginationProps={props}
        searchableColumns={this.props.searchableColumns}
        getColumnKey={this.props.getColumnKey}
        getColumnText={this.props.getColumnText}
        onFilterChange={this.onFilterChange}
      />);
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

DataGrid.ColumnHead = React.createClass({
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
      <div className="column-head" {...dragProps}>
        <DataGrid.ColumnSelectPanel
          currentColumn={this.props.currentColumn}
          shownColumns={this.props.shownColumns}
          columns={this.props.columns}
          getColumnKey={this.props.getColumnKey}
          getColumnText={this.props.getColumnText}
          onShownColumnsChange={this.props.onShownColumnsChange}
        />
        <div className={sortClasses} onClick={this.props.sortable ? this.onSort : null}>
          {this.props.getHeadView(this.props.currentColumn)}
        </div>
      </div>
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

DataGrid.ColumnSelectPanel = React.createClass({
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
        <List items={this.props.columns}
          selection={this.props.shownColumns}
          getItemKey={this.props.getColumnKey}
          getItemView={this.renderOption}
          onSelectionChange={this.onShownColumnsChange} />
      );
    }
    var columnSelectClasses = React.addons.classSet({
      'column-select': true,
      'expanded': this.state.showList
    });
    return (
      <div className={columnSelectClasses}>
        <button className="toggle" onClick={this.onToggleShowList}>.</button>
        {listView}
      </div>
    );
  },
  onShownColumnsChange: function(newSelection){
    this.props.onShownColumnsChange(newSelection);
    this.setState({showList: false});
  },
  renderOption: function(column,args){
    return (<span>{this.props.getColumnText(column)}</span>);
  },
  onToggleShowList: function(){
    this.setState({showList: !this.state.showList});
  }
});

DataGrid.ControlPanel = React.createClass({
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
      filterPanel = (<DataGrid.FilterPanel key="filterPanel" {...this.props} />);
    }
    return (
      <div className="control-panel">
        <React.addons.CSSTransitionGroup transitionName="filter-panel">
          {filterPanel}
        </React.addons.CSSTransitionGroup>
        <div className="pagination-panel">
          <button onClick={this.onToggleShowFilterPanel} className="search">.</button>
          <span>Search</span>
          <DataGrid.Pagination {...this.props.paginationProps} />
          <DataGrid.Summary {...this.props.paginationProps} />
        </div>
      </div>
    );
  },
  onToggleShowFilterPanel: function(){
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }
});

DataGrid.FilterPanel = React.createClass({
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
      return (<option key={columnKey} value={columnKey}>{this.props.getColumnText(column)}</option>);
    }.bind(this));
    return (
      <div className="filter-panel">
        <div className="wrapper">
          <span>Find</span>
          <ThrottledInput value={this.props.filter.key} onChange={this.onFilterKeyChange} />
          <select value={this.getFilterColumn()} onChange={this.onFilterColumnChange}>
            {alternativeOptions}
          </select>
        </div>
      </div>
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

DataGrid.Pagination = React.createClass({
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
      <span className="pagination-view">
        <button className="first" onClick={this.onFirstPage}>{'<<'}</button>
        <button className="previous" onClick={this.onPreviousPage}>{'<'}</button>
        <span>Page</span>
        <ThrottledInput onChange={this.onInputPageNumber} value={(this.props.pageIndex+1).toString()}/>
        <span>of {this.totalPage()}</span>
        <button className="next" onClick={this.onNextPage}>{'>'}</button>
        <button className="last" onClick={this.onLastPage}>{'>>'}</button>
        <button className="refresh" onClick={this.onRefresh}>.</button>
      </span>
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

DataGrid.Summary = React.createClass({
  propTypes: {
    pageIndex: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    totalCount: React.PropTypes.number.isRequired
  },
  render: function(){
    var i = this.props.pageIndex, s = this.props.pageSize, c = this.props.totalCount;
    return (
      <span className="summary">Displaying {i*s + 1} to {Math.min((i+1)*s,c)} of {c} items</span>
    );
  }
});
