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
            React.createElement(ThrottledInput, {onChange: this.onFilterKeyChange, value: this.state.filter.key})
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
    this.setState({showAlternativeViewer: false, filter: _.merge(this.state.filter,{key: ''})});
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
          React.createElement(ThrottledInput, {onChange: this.onFilterKeyChange, value: this.state.filter.key})
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
