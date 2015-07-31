var StateBindToPropsMinxin = function(){
  var propNames = Arguments;
  var bind = function(){
    var newState = {};
    for(var i in propNames){
      var prop = propNames[i];
      newState[prop] = this.props[prop];
    }
    this.setState(newState);
  };
  return {
    componentWillMount: bind,
    componentWillReceiveProps: bind
  };
};

var SelectableMixin = {
  getInitialState: function(){
    return {
      selection: []
    };
  },
  selection: function(){
    return this.state.selection;
  },
  onItemClick: function(itemView,e){
    if(this.props.onItemClick){
      this.props.onItemClick(itemView.props.item,e);
    }

    if(itemView.props.selectable){
      var newSelection;
      if(itemView.props.selected){
        newSelection = _.except(this.state.selection,[itemView.props.item]);
      }else{
        newSelection = _.union(this.state.selection,[itemView.props.item]);
      }
      this.setState({selection: newSelection});

      if(this.props.onSelectionChange) {
        this.props.onSelectionChange(newSelection);
      }
    }
  }
};

var DataViewer = React.createClass({
  getInitialState: function(){
    return {
      loadingStatus: 'init',
      items: [],
      pageIndex: 0,
      totalCount: 0
    };
  },
  propTypes: {
    dataSource: React.PropTypes.func.isRequired,
    filter: React.PropTypes.object,
    pageSize: React.PropTypes.number,
    viewFactory: React.PropTypes.func
  },
  getDefaultProps: function(){
    return {
      filter: {},
      pageSize: 10,
      viewFactory: function(props){
        return <PagingView {...props} />
      }
    };
  },
  componentWillMount: function(){
    this.loadData(0,this.props);
  },
  componentWillReceiveProps: function(nextProps){
    if(this.props === nextProps) return;
    this.loadData(0,nextProps);
  },
  render: function(){
    console.debug("render: DataViewer");
    var view = this.props.viewFactory({
      items: this.state.items,
      pageIndex: this.state.pageIndex,
      pageSize: this.props.pageSize,
      totalCount: this.state.totalCount,
      onNextPage: this.onNextPage
    });
    return (
      <div>
        <ProgressBar status={this.state.loadingStatus} />
        {view}
      </div>
    );
  },
  selection: function(){
    return this.refs.view.selection();
  },
  items: function(){
    return this.refs.view.items();
  },
  loadData: function(pageIndex,props){
    this.setState({loadingStatus: 'loading'});
    props.dataSource(_.merge(props.filter,{
      pageIndex: pageIndex,
      pageSize: props.pageSize
    }),function(result){
      this.setState({
        loadingStatus: 'loaded',
        items: result.data,
        pageIndex: pageIndex,
        totalCount: result.totalCount
      });
    }.bind(this));
  },
  onNextPage: function(pageIndex){
    return this.loadData(pageIndex,this.props);
  }
});

var PagingView = React.createClass({
  propTypes: {
    viewFactory: React.PropTypes.func,
    paginationViewFactory: React.PropTypes.func,
    items: React.PropTypes.arrayOf(React.PropTypes.any).isRequired,
    pageIndex: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    onNextPage: React.PropTypes.func.isRequired,
    totalCount: React.PropTypes.number.isRequired
  },
  getDefaultProps: function(){
    return {
      viewFactory: function(props){
        return (<List {...props} />)
      },
      paginationViewFactory: function(props){
        return (<Pagination {...props} />);
      }
    };
  },
  render: function(){
    console.debug("render PagingView");
    var view = this.props.viewFactory({items: this.props.items});
    var paginationView = this.props.paginationViewFactory({
      pageIndex: this.props.pageIndex,
      pageSize: this.props.pageSize,
      totalCount: this.props.totalCount,
      onNextPage: this.props.onNextPage
    });
    return (
      <div>
        {view}
        {paginationView}
      </div>
    );
  },
  selection: function(){
    return this.refs.view.selection();
  },
  items: function(){
    return this.refs.view.items();
  }
});

var PagedLoadingView = React.createClass({
  getInitialState: function(){
    return {
      items: [],
      pageIndex: 0
    };
  },
  propTypes: {
    viewFactory: React.PropTypes.func,
    items: React.PropTypes.arrayOf(React.PropTypes.any).isRequired,
    pageIndex: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    onNextPage: React.PropTypes.func.isRequired,
    totalCount: React.PropTypes.number.isRequired
  },
  getDefaultProps: function(){
    return {
      viewFactory: function(props){
        return (<List {...props} />);
      }
    };
  },
  componentWillMount: function(){
    this.setState({items: this.props.items});
  },
  componentWillReceiveProps: function(nextProps){
    if(nextProps.pageIndex == 0){
      this.setState({
        items: nextProps.items,
        pageIndex: nextProps.pageIndex
      });
    }else if(nextProps.pageIndex > this.state.pageIndex){
      this.setState({
        items: this.state.items.concat(nextProps.items),
        pageIndex: nextProps.pageIndex
      });
    }
  },
  render: function(){
    console.debug("render PagedLoadingView");
    var morebtn;
    if((this.props.pageIndex+1) * this.props.pageSize < this.props.totalCount){
      morebtn = <button className="paged-loading-view-more" onClick={this.onMoreItems}>more...</button>;
    }
    var view = this.props.viewFactory({
      items: this.state.items,
      children: morebtn
    });
    return (
      <div>
        {view}
      </div>
    );
  },
  selection: function(){
    return this.refs.view.selection();
  },
  items: function(){
    return this.refs.view.items();
  },
  onMoreItems: function(){
    this.props.onNextPage(this.props.pageIndex + 1);
  }
});

var List = React.createClass({
  mixins: [SelectableMixin,StateBindToPropsMinxin('selection')],
  propTypes: {
    items: React.PropTypes.array,
    selection: React.PropTypes.array,
    getItemKey: React.PropTypes.func,
    getItemView: React.PropTypes.func,
    multiSelect: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onItemClick: React.PropTypes.func,
    onSelectionChange: React.PropTypes.func,
    excludeItems: React.PropTypes.array
  },
  getDefaultProps: function(){
    return {
      items: [],
      selection: [],
      getItemKey: function(item){return item.toString();},
      getItemView: function(item){return item.toString();},
      multiSelect: false,
      excludeItems: []
    };
  },
  items: function(){
    return this.props.items;
  },
  render: function(){
    console.debug("render List");
    var list = _.except(this.props.items,this.props.excludeItems).map(function(item){
      return (
        <List.Item key={this.props.getItemKey(item)} item={item}
          selected={_.any(this.state.selection,item)} onClick={this.onItemClick}/>
      );
    }.bind(this));
    var childrenWrapper = React.Children.map(this.props.children,function(child){
      return <List.Item key="children-wrapper" selectable={false}>{child}</List.Item>;
    });
    return (
      <ul className="list-view">
        {list}
        {childrenWrapper}
      </ul>
    );
  }
});

List.Item = React.createClass({
  propTypes: {
    item: React.PropTypes.any,
    selected: React.PropTypes.bool,
    selectable: React.PropTypes.bool,
    onClick: React.PropTypes.func
  },
  getDefaultProps: function(){
    return {
      selected: false,
      selectable: true
    };
  },
  render: function(){
    var classes = React.addons.classSet({
      selected: this.props.selected,
      selectable: this.props.selectable
    });
    return (
      <li className={classes} onClick={this.props.onClick ? this.onClick : null}>
        {this.props.children}
      </li>
    );
  },
  onClick: function(e){
    this.props.onClick(this,e);
  }
});

var Table = React.createClass({
  mixins: [SelectableMixin,StateBindToPropsMinxin('selection')],
  propTypes: {
    items: React.PropTypes.array,
    selection: React.PropTypes.array,
    getItemKey: React.PropTypes.func.isRequired,
    columns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getHeadView: React.PropTypes.func.isRequired,
    getCellView: React.PropTypes.func.isRequired,
    multiSelect: React.PropTypes.bool,
    onHeadClick: React.PropTypes.func,
    onItemClick: React.PropTypes.func,
    onCellClick: React.PropTypes.func,
    onSelectionChange: React.PropTypes.func,
    excludeItems: React.PropTypes.array
  },
  getDefaultProps: function(){
    return {
      items: [],
      selection: [],
      multiSelect: false,
      excludeItems: []
    };
  },
  items: function(){
    return this.props.items;
  },
  render: function(){
    console.debug("render Table");
    var list = _.except(this.props.items,this.props.excludeItems).map(function(item){
      return (
          <Table.Row key={this.props.getItemKey(item)} item={item}
            columns={this.props.columns} getCellView={this.props.getCellView}
            onItemClick={this.onItemClick} onCellClick={this.onCellClick}/>
      );
    }.bind(this));
    var childrenWrapper = React.Children.map(this.props.children,function(child){
      return (
        <Table.Row key="children-wrapper" item={child} colspan={this.props.columns.length}
          columns={[{}]} selectable={false} getCellView={this.renderCellForChildren}/>);
    });
    return (
      <table className="table-view">
        <thead>
          <Table.HeadRow
            columns={this.props.columns}
            getColumnKey={this.props.getColumnKey}
            getHeadView={this.props.getHeadView}
            onHeadClick={this.onHeadClick} />
        </thead>
        <tbody>
          {list}
          {childrenWrapper}
        <tbody>
      </table>
    );
  },
  onHeadClick: function(headCell,e){
    this.props.onHeadClick(headCell.props.column,e);
  },
  onCellClick: function(row,cell,e){
    this.props.onCellClick(row.props.item,cell.props.column,e);
  },
  renderCellForChildren: function(item,column){
    return item;
  }
});

Table.HeadRow = React.createClass({
  propTypes: {
    columns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getHeadView: React.PropTypes.func.isRequired,
    onHeadClick: React.PropTypes.func
  },
  render: function(){
    var list = this.props.columns.map(function(column){
      return (
        <Table.HeadCell key={this.props.getColumnKey(column)} onClick={this.props.onHeadClick ? this.onHeadClick : null}>
          {this.props.getHeadView(column)}
        </Table.HeadCell>
      );
    }.bind(this));
    return (
      <tr>{list}</tr>
    );
  },
  onHeadClick: function(headCell,e){
    this.props.onHeadClick(headCell.props.column,e);
  }
});

Table.HeadCell = React.createClass({
  propTypes: {
    column: React.PropTypes.any.isRequired,
    onClick: React.PropTypes.func
  },
  render: function(){
    return (
      <th onClick={this.props.onClick ? this.onClick : null}>{this.props.children}</th>
    );
  },
  onClick: function(){
    this.props.onClick(this);
  }
});

Table.Row = React.createClass({
  propTypes: {
    item: React.PropTypes.any,
    columns: React.Proptypes.array,
    getCellView: React.PropTypes.func,
    selectable: React.PropTypes.bool,
    selected: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    onCellClick: React.PropTypes.func,
    colspan: React.PropTypes.number
  },
  getDefaultProps: function(){
    return {
      selectable: true,
      selected: false
    };
  },
  render: function(){
    var classes = React.addons.classSet({
      selected: this.props.selected,
      selectable: this.props.selectable
    });
    var list = this.props.columns.map(function(column){
      return (
        <Table.Cell className={classes} item={this.props.item} column={column} selected={this.props.selected}
          onClick={this.props.onCellClick ? this.onCellClick : null} colspan={this.props.colspan}>
          {this.props.children}
        </Table.Cell>
      );
    });
    return (<tr onClick={this.props.onClick ? this.onClick : null} className={classes}>{list}</tr>);
  },
  onClick: function(e){
    this.props.onClick(this,e);
  },
  onCellClick: function(cell,e){
    this.props.onCellClick(this,cell,e);
  }
});

Table.Cell = React.createClass({
  propTypes: {
    column: React.PropTypes.any.isRequired,
    item: React.PropTypes.any.isRequired,
    onClick: React.PropTypes.func,
    colspan: React.Proptypes.number,
    selected: React.PropTypes.selected
  },
  render: function(){
    return (
      <td onClick={this.props.onClick ? this.onClick : null} colspan={this.props.colspan}>
        {this.props.getCellView(this.props.item,this.props.column,{selected: this.props.selected})}
      </td>
    );
  },
  onClick: function(e){
    this.props.onClick(this,e);
  }
});

var ProgressBar = React.createClass({
  propTypes: {
    status: React.PropTypes.oneOf(['init','loading','loaded'])
  },
  getDefaultProps: function(){
    return {
      status: 'init'
    };
  },
  render: function(){
    return (
      <progress className={this.props.status} />
    );
  }
});

var ThrottledInput = React.createClass({
  mixins: [StateBindToPropsMinxin('value')]
  getInitialState: function(){
    return {
      value: ''
    };
  },
  propTypes: {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  },
  componentWillMount: function(){
    this.onChangeThrottled = throttle(1000,this.onChangeThrottled).bind(this);
  },
  render: function(){
    return (
      <input onChange={this.onChange} value={this.props.value} />
    );
  },
  onChange: function(e){
    this.setState({value: e.target.value});
    this.onChangeThrottled(this.state.value);
  },
  onChangeThrottled: function(value){
    this.props.onChange(value);
  }
});

var Pagination = React.createClass({
  propTypes: {
    viewWidth: React.PropTypes.number,
    pageIndex: React.PropTypes.number.isRequired,
    pageSize: React.PropTypes.number.isRequired,
    totalCount: React.PropTypes.number.isRequired,
    onNextPage: React.PropTypes.func.isRequired,
  },
  getDefaultProps: function(){
    return {
      viewWidth: 5
    };
  },
  render: function(){
    var totalPageCount = Math.ceil(this.props.totalCount / this.props.pageSize);
    var start = this.props.pageIndex - this.props.pageIndex % this.props.viewWidth;
    var count = Math.min(start + this.props.viewWidth, totalPageCount) - start;
    var newItem = function(pageIndex,content){
      return (
        <Pagination.Item key={pageIndex} value={pageIndex} content={content} selected={pageIndex==this.props.pageIndex} onClick={this.onNextPage} />
      );
    }.bind(this);
    var list = _.range(start,count).map(function(pageIndex){
      return newItem(pageIndex,pageIndex + 1);
    });
    if(start > 0){
      list.shift(newItem(start-1,"<<"));
    }
    if(start + count < this.props.totalPageCount){
      list.push(newItem(start + count,">>"));
    }
    return (
      <ul className="pagination">
        {list}
      </ul>
    );
  },
  onNextPage: function(viewItem){
    console.debug("next-page: "+viewItem.props.value);
    this.props.onNextPage(viewItem.props.value);
  }
});

Pagination.Item = React.createClass({
  propTypes: {
    content: React.PropTypes.any.isRequired,
    value: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func.isRequired,
    selected: React.PropTypes.bool
  },
  getDefaultProps: function(){
    return {
      selected: false
    };
  },
  render: function(){
    return <li className={this.props.selected?'active':''}><a href="#" onClick={this.onClick}>{this.props.content}</a></li>;
  },
  onClick: function(e){
    e.preventDefault();
    this.props.onClick(this);
  }
});
