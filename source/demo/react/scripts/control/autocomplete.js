///<reference path="../lib/react-with-addons.js" />
///<reference path="../common.js" />

var AutoCompleteWithPopup = React.createClass({displayName: "AutoCompleteWithPopup",
  getInitialState: function(){
    return {
      selection: [],
      showPopup: false
    };
  },
  propTypes: {
    dataSource: React.PropTypes.func,
    getItemKey: React.PropTypes.func,
    getItemView: React.PropTypes.func,
    getItemFilter: React.PropTypes.func
  },
  getDefaultProps: function(){
    return {
      getItemKey: function(item){
        return item.toString();
      },
      getItemView: function(item){
        return item.toString();
      },
      getItemFilter: function(item,filter){
        return true;
      }
    }
  },
  render: function(){
    console.debug("render: AutoCompleteWithPopup");
    var attrs = {
      onSelectionChange: this.onSelectionChange,
      selection: this.state.selection,
      dataSource: this.props.dataSource,
      getItemKey: this.props.getItemKey,
      getItemView: this.props.getItemView,
      getItemFilter: this.props.getItemFilter
    };
    var popup;
    if(this.state.showPopup){
      popup = React.createElement(AutoCompleteWithPopup.Popup, React.__spread({},   attrs, {onClose: _.bind(this.onTogglePopup,this,false)}))
    }
    return (
      React.createElement("div", {className: "autocomplete-container"}, 
        React.createElement(AutoCompleteWithPopup.AutoComplete, React.__spread({},  attrs)), 
        React.createElement("button", {className: "show-popup", onClick: _.bind(this.onTogglePopup,this,true)}), 
        popup
      )
    );
  },
  onSelectionChange: function(newSelection){
    console.debug("selection change");
    console.debug(newSelection);
    this.setState({selection: newSelection});
  },
  onTogglePopup: function(showPopup){
    console.debug("on toggle popup: "+showPopup);
    this.setState({showPopup: showPopup});
  }
});

AutoCompleteWithPopup.AutoComplete = React.createClass({displayName: "AutoComplete",
  getInitialState: function(){
    return {
      filter: {key: ''},
      showAlternativeViewer: false,
    };
  },
  propTypes: {
    selection: React.PropTypes.array.isRequired,
    onSelectionChange: React.PropTypes.func.isRequired,
    selection: React.PropTypes.array.isRequired,
    dataSource: React.PropTypes.func.isRequired,
    getItemKey: React.PropTypes.func,
    getItemView: React.PropTypes.func
  },
  render: function(){
    console.debug("render: AutoComplete");
    var alternativeViewer;
    if(this.state.showAlternativeViewer){
      alternativeViewer = (
        React.createElement("div", {className: "alternative"}, 
          React.createElement(DataViewer, {dataSource: this.props.dataSource, filter: this.state.filter, viewFactory: this.alternativeViewFactory})
        )
      );
    }
    return (
      React.createElement("div", {className: "autocomplete"}, 
        React.createElement("div", {className: "selection"}, 
          React.createElement(List, {items: this.props.selection, getItemKey: this.props.getItemKey, getItemView: this.selectionItemView, onItemClick: this.onRemoveSelection}, 
            React.createElement(ThrottledInput, {onChange: this.onFilterKeyChange})
          )
        ), 
        alternativeViewer
      )
    );
  },
  selectionItemView: function(item){
    return (React.createElement("div", null, this.props.getItemView(item), React.createElement("button", {className: "close"})))
  },
  alternativeViewFactory: function(props){
    return (React.createElement(PagingView, React.__spread({},  props, {viewFactory: this.alternativeInternalViewFactory})));
  },
  alternativeInternalViewFactory: function(props){
    return (React.createElement(List, React.__spread({},  props, {excludeItems: this.props.selection, getItemKey: this.props.getItemKey, getItemView: this.props.getItemView, multiSelect: false, onItemClick: this.onAddSelection})));
  },
  onFilterKeyChange: function(newFilterKey){
    this.setState({filter: {key: newFilterKey}, showAlternativeViewer: true});
  },
  onAddSelection: function(item){
    this.setState({showAlternativeViewer: false});
    this.props.onSelectionChange(_.union(this.props.selection,[item]));
  },
  onRemoveSelection: function(item,e){
    if(!e.target.classList.contains('close')) return;
    this.props.onSelectionChange(_.except(this.props.selection,[item]));
  }
});

AutoCompleteWithPopup.Popup = React.createClass({displayName: "Popup",
  propTypes: {
    getItemKey: React.PropTypes.func.isRequired,
    getItemView: React.PropTypes.func.isRequired,
    getItemFilter: React.PropTypes.func.isRequired,
    selection: React.PropTypes.array.isRequired,
    dataSource: React.PropTypes.func.isRequired,
    onSelectionChange: React.PropTypes.func.isRequired,
    onClose: React.PropTypes.func
  },
  getDefaultProps: function(){
    return {
      onClose: function(){}
    };
  },
  render: function(){
    return (
      React.createElement("div", {className: "modal popup"}, 
        React.createElement("div", {className: "modal-dialog", ref: "dialog"}, 
          React.createElement("div", {className: "modal-content"}, 
            React.createElement("div", {className: "modal-header", onMouseDown: this.onDialogMouseDown}, 
              React.createElement("button", {type: "button", onClick: this.props.onClose, className: "close"}), 
              React.createElement("h4", {className: "modal-title"}, "Select")
            ), 
            React.createElement("div", {className: "modal-body row"}, 
              React.createElement("div", {className: "col-md-5"}, 
                React.createElement(AutoCompleteWithPopup.Popup.Box, {key: "left", ref: "left", getItemKey: this.props.getItemKey, getItemView: this.props.getItemView, dataSource: this.props.dataSource, excludeItems: this.props.selection})
              ), 
              React.createElement("div", {className: "col-md-2 btn-group-vertical"}, 
                React.createElement("button", {className: "btn btn-default", onClick: this.onToLeft}, '<'), 
                React.createElement("button", {className: "btn btn-default", onClick: this.onToLeftAll}, '<<'), 
                React.createElement("button", {className: "btn btn-default", onClick: this.onToRight}, '>'), 
                React.createElement("button", {className: "btn btn-default", onClick: this.onToRightAll}, '>>')
              ), 
              React.createElement("div", {className: "col-md-5"}, 
                React.createElement(AutoCompleteWithPopup.Popup.Box, {key: "right", ref: "right", getItemKey: this.props.getItemKey, getItemView: this.props.getItemView, dataSource: this.selectionDataSource, excludeItems: []})
              )
            )
          )
        )
      )
    );
  },
  selectionDataSource: function(filter,callback){
    var matchedRows = this.props.selection.filter(function(item){
      return this.props.getItemFilter(item,filter);
    }.bind(this));
    var returnedRows = matchedRows.slice(filter.pageIndex*filter.pageSize,(filter.pageIndex+1)*filter.pageSize);
    callback({
      data: returnedRows,
      totalCount: matchedRows.length
    });
  },
  onToLeft: function(){
    this.props.onSelectionChange(_.except(this.props.selection,this.refs.right.selection()));
  },
  onToLeftAll: function(){
    this.props.onSelectionChange([]);
  },
  onToRight: function(){
    this.props.onSelectionChange(_.union(this.props.selection,this.refs.left.selection()));
  },
  onToRightAll: function(){
    this.props.onSelectionChange(this.refs.left.items());
  },
  onDialogMouseDown: function(e){
    $('body').bind('mousemove',this.onDialogMouseMove);
    $('body').bind('mouseup',this.onDialogMouseUp);
    var dialog = this.refs.dialog.getDOMNode();
    this.originMousePos = {x: e.clientX, y: e.clientY};
    this.originDialogPos = {x: dialog.offsetLeft, y: dialog.offsetTop};
  },
  onDialogMouseMove: function(e){
    var delta = {x: e.clientX - this.originMousePos.x, y: e.clientY - this.originMousePos.y};
    var newDialogPos = {x: this.originDialogPos.x + delta.x, y: this.originDialogPos.y + delta.y};
    var dialog = this.refs.dialog.getDOMNode();
    dialog.style.marginLeft = newDialogPos.x;
    dialog.style.marginTop = newDialogPos.y;
  },
  onDialogMouseUp: function(e){
    $('body').unbind('mousemove',this.onDialogMouseMove);
    $('body').unbind('mouseup',this.onDialogMouseUp);
    this.originMousePos = this.originDialogPos = undefined;
  }
});

AutoCompleteWithPopup.Popup.Box = React.createClass({displayName: "Box",
  getInitialState: function(){
    return {
      filter: {key: ''}
    };
  },
  propTypes: {
    getItemKey: React.PropTypes.func.isRequired,
    getItemView: React.PropTypes.func.isRequired,
    dataSource: React.PropTypes.func.isRequired,
    excludeItems: React.PropTypes.array.isRequired
  },
  render: function(){
    return (
      React.createElement("div", null, 
        React.createElement("div", {className: "filter"}, 
          React.createElement(ThrottledInput, {onChange: this.onFilterKeyChange})
        ), 
        React.createElement(DataViewer, {ref: "viewer", viewFactory: this.viewFactory, dataSource: this.props.dataSource, filter: this.state.filter})
      )
    );
  },
  viewFactory: function(props){
    return (React.createElement(PagedLoadingView, React.__spread({ref: "view"},  props, {viewFactory: this.internalViewFactory})));
  },
  internalViewFactory: function(props){
    return (React.createElement(List, React.__spread({ref: "view"},  props, {excludeItems: this.props.excludeItems, getItemKey: this.props.getItemKey, getItemView: this.props.getItemView, multiSelect: true})));
  },
  onFilterKeyChange: function(newFilterKey){
    this.setState({filter: {key: newFilterKey}});
  },
  selection: function(){
    return this.refs.viewer.selection();
  },
  items: function(){
    return this.refs.viewer.items();
  }
});

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
    console.debug("render: DataViewer");
    var view = this.props.viewFactory({
      items: this.state.items,
      pageIndex: this.state.pageIndex,
      pageSize: this.props.pageSize,
      totalCount: this.state.totalCount,
      onNextPage: this.onNextPage
    });
    return (
      React.createElement("div", null, 
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
      }
    };
  },
  render: function(){
    console.debug("render PagingView");
    var view = this.props.viewFactory({items: this.props.items});
    return (
      React.createElement("div", null, 
        view, 
        React.createElement(Pagination, {
          currentPageIndex: this.props.pageIndex, 
          totalPageCount: Math.ceil(this.props.totalCount / this.props.pageSize), 
          onNextPage: this.props.onNextPage})
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
      morebtn = React.createElement("button", {className: "paged-loading-view-more", onClick: this.onMoreItems}, "more...");
    }
    var view = this.props.viewFactory({
      items: this.state.items,
      children: morebtn
    });
    return (
      React.createElement("div", null, 
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
  propTypes: {
    items: React.PropTypes.array,
    getItemKey: React.PropTypes.func,
    getItemView: React.PropTypes.func,
    multiSelect: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onItemClick: React.PropTypes.func,
    excludeItems: React.PropTypes.array
  },
  getDefaultProps: function(){
    return {
      items: [],
      getItemKey: function(item){return item.toString();},
      getItemView: function(item){return item.toString();},
      multiSelect: false,
      onSelect: function(){},
      onItemClick: function(){},
      excludeItems: []
    };
  },
  selection: function(){
    var result = this.props.items.filter(function(item){
      var viewItem = this.refs[".item-" + this.props.getItemKey(item)];
      return viewItem && viewItem.isSelected();
    }.bind(this));
    console.debug("selection: ")
    console.debug(result);
    return result;
  },
  items: function(){
    return this.props.items;
  },
  render: function(){
    console.debug("render List");
    var list = _.except(this.props.items,this.props.excludeItems).map(function(item){
      var key = this.props.getItemKey(item);
      return React.createElement(List.Item, {ref: ".item-"+key, key: key, value: item, onClick: this.onItemClick}, this.props.getItemView(item));
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
  },
  onItemClick: function(listItem,e){
    this.props.onItemClick(listItem.props.value,e);
  }
});

List.Item = React.createClass({displayName: "Item",
  getInitialState: function(){
    return {
      selected: false
    };
  },
  propTypes: {
    value: React.PropTypes.any,
    selectable: React.PropTypes.bool,
    onClick: React.PropTypes.func
  },
  getDefaultProps: function(){
    return {
      selectable: true,
      onClick: function(){}
    };
  },
  render: function(){
    var classes = React.addons.classSet({
      selected: this.state.selected,
      selectable: this.props.selectable
    });
    return (
      React.createElement("li", {className: classes, onClick: this.onClick}, 
        this.props.children
      )
    );
  },
  isSelected: function(){
    return this.state.selected;
  },
  select: function(){
    this.setState({selected: true});
  },
  value: function(){
    return this.props.value;
  },
  onClick: function(e){
    this.props.onClick(this,e);
    if(this.props.selectable){
      this.setState({selected: !this.state.selected});
    }
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
  getInitialState: function(){
    return {};
  },
  propTypes: {
    defaultValue: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired
  },
  componentWillMount: function(){
    this.onChangeThrottled = throttle(1000,this.onChange).bind(this);
  },
  render: function(){
    return (
      React.createElement("input", {ref: "input", onChange: this.onChangeThrottled, defaultValue: this.props.defaultValue})
    );
  },
  onChange: function(){
    this.props.onChange(this.refs.input.getDOMNode().value);
  }
});

var Pagination = React.createClass({displayName: "Pagination",
  propTypes: {
    viewWidth: React.PropTypes.number,
    currentPageIndex: React.PropTypes.number.isRequired,
    totalPageCount: React.PropTypes.number.isRequired,
    onNextPage: React.PropTypes.func.isRequired,
  },
  getDefaultProps: function(){
    return {
      viewWidth: 5
    };
  },
  render: function(){
    var start = this.props.currentPageIndex - this.props.currentPageIndex % this.props.viewWidth;
    var count = Math.min(start+this.props.viewWidth,this.props.totalPageCount) - start;
    var newItem = function(pageIndex,content){
      return (
        React.createElement(Pagination.Item, {key: pageIndex, value: pageIndex, content: content, selected: pageIndex==this.props.currentPageIndex, onClick: this.onNextPage})
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
})
