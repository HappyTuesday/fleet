var StateBindToPropsMinxin = function(){
  var propNames = arguments;
  return {
    componentWillMount: function(){
      var newState = {};
      for(var i in propNames){
        var prop = propNames[i];
        newState[prop] = this.props[prop];
      }
      this.setState(newState);
    },
    componentWillReceiveProps: function(nextProps){
      var newState = {};
      for(var i in propNames){
        var prop = propNames[i];
        newState[prop] = nextProps[prop];
      }
      this.setState(newState);
    }
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
        newSelection = this.props.items.filter(function(item){
          return _.any(this.state.selection,item) || item == itemView.props.item;
        }.bind(this));
      }
      this.setState({selection: newSelection});

      if(this.props.onSelectionChange) {
        this.props.onSelectionChange(newSelection);
      }
    }
  }
};

var DataViewer = React.createClass({displayName: "DataViewer",
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
        return React.createElement(PagingView, React.__spread({},  props))
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
    console.debug("render DataViewer");
    //console.debug(this.state.items);
    var view = this.props.viewFactory({
      items: this.state.items,
      pageIndex: this.state.pageIndex,
      pageSize: this.props.pageSize,
      totalCount: this.state.totalCount,
      onNextPage: this.onNextPage
    });
    return (
      React.createElement("div", {className: "data-viewer"}, 
        React.createElement(ProgressBar, {status: this.state.loadingStatus}), 
        view
      )
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

var PagingView = React.createClass({displayName: "PagingView",
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
        return (React.createElement(List, React.__spread({},  props)))
      },
      paginationViewFactory: function(props){
        return (React.createElement(Pagination, React.__spread({},  props)));
      }
    };
  },
  render: function(){
    console.debug("render PagingView");
    //console.debug(this.props);
    var view = this.props.viewFactory({items: this.props.items});
    var paginationView = this.props.paginationViewFactory({
      pageIndex: this.props.pageIndex,
      pageSize: this.props.pageSize,
      totalCount: this.props.totalCount,
      onNextPage: this.props.onNextPage
    });
    return (
      React.createElement("div", {className: "paging-view"}, 
        view, 
        paginationView
      )
    );
  },
  selection: function(){
    return this.refs.view.selection();
  },
  items: function(){
    return this.refs.view.items();
  }
});

var PagedLoadingView = React.createClass({displayName: "PagedLoadingView",
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
        return (React.createElement(List, React.__spread({},  props)));
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
      morebtn = React.createElement("button", {className: "more", onClick: this.onMoreItems}, "more...");
    }
    var view = this.props.viewFactory({
      items: this.state.items,
      children: morebtn
    });
    return (
      React.createElement("div", {className: "paged-loading-view"}, 
        view
      )
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

var List = React.createClass({displayName: "List",
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
        React.createElement(List.Item, {key: this.props.getItemKey(item), item: item, 
          selected: _.any(this.state.selection,item), 
          onClick: this.onItemClick}, 
          this.props.getItemView(item,{selected: _.any(this.props.selection,item)})
        )
      );
    }.bind(this));
    var childrenWrapper = React.Children.map(this.props.children,function(child){
      return React.createElement(List.Item, {key: "children-wrapper", selectable: false}, child);
    });
    return (
      React.createElement("ul", {className: "list-view"}, 
        list, 
        childrenWrapper
      )
    );
  }
});

List.Item = React.createClass({displayName: "Item",
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
      React.createElement("li", {className: classes, onClick: this.props.onClick ? this.onClick : null}, 
        this.props.children
      )
    );
  },
  onClick: function(e){
    this.props.onClick(this,e);
  }
});

var Table = React.createClass({displayName: "Table",
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
    //console.debug(this.props);
    var list = _.except(this.props.items, this.props.excludeItems).map(function(item){
      return (
        React.createElement(Table.Row, {key: this.props.getItemKey(item), item: item, 
          selected: _.any(this.props.selection,item), 
          columns: this.props.columns, 
          getColumnKey: this.props.getColumnKey, 
          getCellView: this.props.getCellView, 
          onClick: this.props.onItemClick ? this.onItemClick : null, 
          onCellClick: this.props.onCellClick ? this.onCellClick : null}
        ));
    }.bind(this));
    var childrenWrapper = React.Children.map(this.props.children,function(child){
      return (
        React.createElement(Table.Row, {key: "children-wrapper", item: child, 
          colspan: this.props.columns.length, 
          columns: [{}], 
          selectable: false, 
          getCellView: this.renderCellForChildren}
        ));
    });
    return (
      React.createElement("table", {className: "table-view"}, 
        React.createElement("thead", null, 
          React.createElement(Table.HeadRow, {
            columns: this.props.columns, 
            getColumnKey: this.props.getColumnKey, 
            getHeadView: this.props.getHeadView, 
            onHeadClick: this.props.onHeadClick ? this.onHeadClick : null})
        ), 
        React.createElement("tbody", null, 
          list, 
          childrenWrapper
        )
      )
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
  },
  getColumnKeyForChildren: function(){
    return "children-wrapper";
  }
});

Table.HeadRow = React.createClass({displayName: "HeadRow",
  propTypes: {
    columns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getHeadView: React.PropTypes.func.isRequired,
    onHeadClick: React.PropTypes.func
  },
  render: function(){
    var list = this.props.columns.map(function(column){
      return (
        React.createElement(Table.HeadCell, {key: this.props.getColumnKey(column), column: column, 
          onClick: this.props.onHeadClick ? this.onHeadClick : null}, 
          this.props.getHeadView(column)
        )
      );
    }.bind(this));
    return (
      React.createElement("tr", null, list)
    );
  },
  onHeadClick: function(headCell,e){
    this.props.onHeadClick(headCell,e);
  }
});

Table.HeadCell = React.createClass({displayName: "HeadCell",
  propTypes: {
    column: React.PropTypes.any.isRequired,
    onClick: React.PropTypes.func
  },
  render: function(){
    return (
      React.createElement("th", {onClick: this.props.onClick ? this.onClick : null}, this.props.children)
    );
  },
  onClick: function(){
    this.props.onClick(this);
  }
});

Table.Row = React.createClass({displayName: "Row",
  propTypes: {
    item: React.PropTypes.any.isRequired,
    columns: React.PropTypes.array.isRequired,
    getColumnKey: React.PropTypes.func.isRequired,
    getCellView: React.PropTypes.func.isRequired,
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
    //console.debug("render Table.Row");
    //console.debug(this.props);
    var classes = React.addons.classSet({
      selected: this.props.selected,
      selectable: this.props.selectable
    });
    var list = this.props.columns.map(function(column){
      //console.debug("column key="+this.props.getColumnKey(column));
      return (
        React.createElement(Table.Cell, {key: this.props.getColumnKey(column), className: classes, item: this.props.item, column: column, selected: this.props.selected, 
          onClick: this.props.onCellClick ? this.onCellClick : null, colspan: this.props.colspan}, 
          this.props.getCellView(this.props.item,column,{selected: this.props.selected})
        )
      );
    }.bind(this));
    return (React.createElement("tr", {onClick: this.props.onClick ? this.onClick : null, className: classes}, list));
  },
  onClick: function(e){
    this.props.onClick(this,e);
  },
  onCellClick: function(cell,e){
    this.props.onCellClick(this,cell,e);
  }
});

Table.Cell = React.createClass({displayName: "Cell",
  propTypes: {
    column: React.PropTypes.any.isRequired,
    item: React.PropTypes.any.isRequired,
    onClick: React.PropTypes.func,
    colspan: React.PropTypes.number,
    selected: React.PropTypes.bool
  },
  render: function(){
    return (
      React.createElement("td", {colspan: this.props.colspan, 
        onClick: this.props.onClick ? this.onClick : null}, 
        this.props.children
      )
    );
  },
  onClick: function(e){
    this.props.onClick(this,e);
  }
});

var ProgressBar = React.createClass({displayName: "ProgressBar",
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
      React.createElement("progress", {className: this.props.status})
    );
  }
});

var ThrottledInput = React.createClass({displayName: "ThrottledInput",
  mixins: [StateBindToPropsMinxin("value")],
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
    console.debug("render ThrottledInput");
    return (
      React.createElement("input", {className: "throttled-input", onChange: this.onChange, value: this.state.value})
    );
  },
  onChange: function(e){
    var newValue = e.target.value
    this.setState({value: newValue});
    this.onChangeThrottled(newValue);
  },
  onChangeThrottled: function(value){
    this.props.onChange(value);
  }
});

var Pagination = React.createClass({displayName: "Pagination",
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
    var count = Math.min(this.props.viewWidth, totalPageCount - start);
    var newItem = function(pageIndex,content){
      return (
        React.createElement(Pagination.Item, {key: pageIndex, value: pageIndex, content: content, selected: pageIndex==this.props.pageIndex, onClick: this.onNextPage})
      );
    }.bind(this);
    var list = _.range(start,count).map(function(pageIndex){
      return newItem(pageIndex,pageIndex + 1);
    });
    if(start > 0){
      list.unshift(newItem(start-1,"<<"));
    }
    if(start + count < totalPageCount){
      list.push(newItem(start + count,">>"));
    }
    return (
      React.createElement("ul", {className: "pagination"}, 
        list
      )
    );
  },
  onNextPage: function(viewItem){
    console.debug("next-page: "+viewItem.props.value);
    this.props.onNextPage(viewItem.props.value);
  }
});

Pagination.Item = React.createClass({displayName: "Item",
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
    return React.createElement("li", {className: this.props.selected?'active':''}, React.createElement("a", {href: "#", onClick: this.onClick}, this.props.content));
  },
  onClick: function(e){
    e.preventDefault();
    this.props.onClick(this);
  }
});
