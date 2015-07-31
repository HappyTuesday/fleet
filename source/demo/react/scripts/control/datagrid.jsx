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
    return (
      <DataGrid dataSource={this.props.dataSource} columns={this.props.columns}
        getItemKey={this.getItemKey} getColumnKey={this.getColumnKey}
        getHeadView={this.getHeadView} getCellView={this.getCellView}
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
      return render(item,column);
    }else{
      return (<span>{item[column.name]}</span>);
    }
  }
});

var DataGrid = React.createClass({
  getInitialState: function(){
    return {
      shownColumns: [],
      filter: {
        key: '',
        filterColumn: [],
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
    return (
      <DataViewer dataSource={this.props.dataSource} filter={this.state.filter}
        pageSize={this.state.filter.pageSize} viewFactory={this.renderPagingView} />
    );
  },
  renderPagingView: function(props){
    return (
      <PagingView {...props} viewFactory={this.renderInternalView} paginationViewFactory={this.renderControlPanelView} />
    );
  },
  renderInternalView: function(props){
    return (
      <Table {...props} getItemKey={this.getItemKey} columns={this.state.shownColumns} getColumnKey={this.props.getColumnKey}
        getHeadView={this.renderColumnHead} getCellView={this.props.getCellView} />
    );
  },
  renderColumnHead: function(column){
    var dragProps = {
      draggable: true,
      onHeadDrag: this.onHeadDrag,
      onHeadDragOver: this.onHeadDragOver,
      onHeadDrop: this.onHeadDrop
    };
    return (
      <DataGrid.ColumnHead currentColumn={column} {...dragProps}
        shownColumns={this.props.shownColumns} columns={this.props.columns}
        getColumnKey={this.props.getColumnKey} getHeadView={this.props.getHeadView}
        getColumnText={this.props.getHeadText}
        onShownColumnsChange={this.changeShownColumns}
        onHeadClick={this.onOrderbyColumnChange}/>
    );
  },
  renderControlPanelView: function(props){
    return (
      <DataGrid.ControlPanel filter={this.state.filter} paginationProps={props}
        searchableColumns={this.props.searchableColumns}
        getColumnKey={this.props.getColumnKey} getColumnText={this.props.getHeadText}
        onFilterChange={this.onFilterChange} />
    );
  },
  changeShownColumns: function(newShownColumns){
    this.setState({shownColumns: newShownColumns});
  },
  onFilterChange: function(newFilter){
    this.setState({filter: _.merge(this.state.filter, newFilter)});
  },
  onOrderbyColumnChange: function(column){
    if(!this.props.sortableColumns,column || !_.any(this.props.sortableColumns,column)) return;
    var columnKey = this.props.getColumnKey(column);
    this.setState({filter: _.merge(this.state.filter, {
      orderbyColumn: columnKey,
      desc: columnKey == this.state.filter.orderbyColumn ? !this.state.filter.desc : this.state.filter.desc
    })});
  },
  onColumnDrag: function(columnHead){
    this.currentDraggedColumn = columnHead.currentColumn;
  },
  onColumnDragOver: function(columnHead,e){
    if(!this.currentDraggedColumn) return;
    e.preventDefault();
  },
  onColumnDrop: function(columnHead){
    if(!this.currentDraggedColumn) return;
    this.exchangeColumnSequences(this.currentDraggedColumn, columnHead.currentColumn);
  },
  exchangeColumnSequences: function(fromColumn, toColumn){
    var i,j,columns = _.union(this.props.shownColumns,[]);
    for(var k in columns){
      var col = columns[k];
      if(col == fromColumn){
        i = k;
      }else if(col == toColumn){
        j = k;
      }
    }
    console.debug("adjust column sequence from " + i + " to " + j);
    var temp;
    if(i < j){
      for(var k = i;k<j;k++){
        temp = columns[k];
        columns[k] = columns[k+1];
        columns[k+1] = temp;
      }
    }else{
      for(var k = i;k>j;k--){
        temp = columns[k];
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
    currentColumn: React.Proptypes.any.isRequired,
    shownColumns: React.PropTypes.array.isRequired,
    columns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getHeadView: React.PropTypes.func.isRequired,
    getColumnText: React.PropTypes.func.isRequired,
    onShownColumnsChange: React.PropTypes.func.isRequired,
    onHeadClick: React.PropTypes.func.isRequired,
    onColumnSequenceChange: React.PropTypes.func.isRequired,
    draggable: React.PropTypes.bool,
    onColumnDrag: React.PropTypes.func.isRequired,
    onColumnDragOver: React.PropTypes.func.isRequired,
    onColumnDrop: React.PropTypes.func.isRequired,
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
    return (
      <div ref="head">
        <div onClick={this.onHeadClick} {...dragProps}>
          {this.props.getHeadView(this.props.currentColumn)}
        </div>
        <DataGrid.ColumnSelectPanel {...this.props} />
      </div>
    );
  },
  onHeadClick: function(){
    this.props.onHeadClick(this.props.currentColumn);
  },
  onDrag: function(e){
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
    currentColumn: React.Proptypes.any.isRequired,
    shownColumns: React.PropTypes.array.isRequired,
    columns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getColumnText: React.PropTypes.func.isRequired,
    onShownColumnsChange: React.PropTypes.func.isRequired
  },
  render: function(){
    return (
      <div>
        <button onClick={this.onToggleShowList} />
        <List items={this.props.columns} selection={this.props.shownColumns}
          getItemKey={this.props.getColumnKey} getItemView={this.renderOption}
          onSelectionChange={this.props.onShownColumnsChange} />
      </div>
    );
  },
  renderOption: function(column,args){
    return (<span><input type="checkbox" checked={args.selected}>{this.props.getColumnText(column)}</span>);
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
    paginationProps: React.Proptypes.func.object.isRequired
  },
  render: function(){
    var filterPanel;
    if(this.state.showFilterPanel && this.props.serachableColumns){
      filterPanel = (<DataGrid.FilterPanel {...this.props} />);
    }
    return (
      <div className="control-panel">
        {filterPanel}
        <div>
          <button onClick={onToggleShowFilterPanel} className={showFilterPanel?'down':'up'} />
          <DataGrid.Pagination {...this.props.paginationProps} />
          <DataGrid.Summary {...this.props.paginationProps} />
        </div>
      </div>
    );
  }
});

DataGrid.FilterPanel = React.createClass({
  mixins: [StateBindToPropsMinxin('filter')]
  getInitialState: function(){
    filter: {}
  },
  propTypes: {
    filter: React.PropTypes.object.isRequired,
    onFilterChange: React.PropTypes.func.isRequired,
    searchableColumns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getColumnText: React.PropTypes.func.isRequired,
  },
  render: function(){
    var alternativeOptions = this.props.serachableColumns.map(function(column){
      return (<option key={this.props.getColumnKey(column)})>{this.props.getColumnText(column)}</option>);
    }.bind(this));
    return (
      <div>
        <span>Find</span>
        <ThrottleInput value={this.state.filter.key} onChange={this.onFilterKeyChange} />
        <select ref="alternative" value={this.state.filter.filterColumn} onChange{this.onFilterColumnChange}>
          {alternativeOptions}
        </select>
      </div>
    );
  },
  onFilterKeyChange: function(value){
    this.setState({filter: _.merge({key: value})});
    this.props.onFilterChange(this.state.filter);
  },
  onFilterColumnChange: function(){
    this.setState({filter: _.merge({filterColumn: this.refs.alternative.value})});
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
    return (
      <span className="pagination-view">
        <button className="first" onClick={this.onFirstPage}/>
        <button className="previous" onClick={this.onPreviousPage}/>
        <span>Page</span>
        <ThrottledInput onClick={this.onInputPageNumber} value={this.props.pageIndex}/>
        <span>of {this.totalPage()}</span>
        <button className="next" onClick={this.onNextPage}/>
        <button className="last" onClick={this.onLastPage}/>
        <button className="refresh" onClick={this.onRefresh}/>
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
    this.props.onNextPage(parseInt(value));
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
      <span>Displaying {i*s + 1} to {Math.min((i+1)*s,c)} of {c} items</span>
    );
  }
});
