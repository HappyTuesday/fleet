///<reference path="../lib/react-with-addons.js" />
///<reference path="../common.js" />

var AutoCompleteWithPopup = React.createClass({
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
      popup = <AutoCompleteWithPopup.Popup {... attrs} onClose={_.bind(this.onTogglePopup,this,false)} />
    }
    return (
      <div className="autocomplete-container">
        <AutoCompleteWithPopup.AutoComplete {...attrs} />
        <button className="show-popup" onClick={_.bind(this.onTogglePopup,this,true)}></button>
        {popup}
      </div>
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

AutoCompleteWithPopup.AutoComplete = React.createClass({
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
        <div className="alternative">
          <DataViewer dataSource={this.props.dataSource} filter={this.state.filter} viewFactory={this.alternativeViewFactory} />
        </div>
      );
    }
    return (
      <div className="autocomplete">
        <div className="selection">
          <List items={this.props.selection} getItemKey={this.props.getItemKey} getItemView={this.selectionItemView} onItemClick={this.onRemoveSelection}>
            <ThrottledInput onChange={this.onFilterKeyChange} value={this.state.filter.key} />
          </List>
        </div>
        {alternativeViewer}
      </div>
    );
  },
  selectionItemView: function(item){
    return (<div>{this.props.getItemView(item)}<button className="close"></button></div>)
  },
  alternativeViewFactory: function(props){
    return (<PagingView {...props} viewFactory={this.alternativeInternalViewFactory} />);
  },
  alternativeInternalViewFactory: function(props){
    return (<List {...props} excludeItems={this.props.selection} getItemKey={this.props.getItemKey} getItemView={this.props.getItemView} multiSelect={false} onItemClick={this.onAddSelection} />);
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

AutoCompleteWithPopup.Popup = React.createClass({
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
      <div className="modal popup">
        <div className="modal-dialog" ref="dialog">
          <div className="modal-content">
            <div className="modal-header" onMouseDown={this.onDialogMouseDown}>
              <button type="button" onClick={this.props.onClose} className="close"></button>
              <h4 className="modal-title">Select</h4>
            </div>
            <div className="modal-body row">
              <div className="col-md-5">
                <AutoCompleteWithPopup.Popup.Box key="left" ref="left" getItemKey={this.props.getItemKey} getItemView={this.props.getItemView} dataSource={this.props.dataSource} excludeItems={this.props.selection} />
              </div>
              <div className="col-md-2 btn-group-vertical">
                <button className="btn btn-default" onClick={this.onToLeft}>{'<'}</button>
                <button className="btn btn-default" onClick={this.onToLeftAll}>{'<<'}</button>
                <button className="btn btn-default" onClick={this.onToRight}>{'>'}</button>
                <button className="btn btn-default" onClick={this.onToRightAll}>{'>>'}</button>
              </div>
              <div className="col-md-5">
                <AutoCompleteWithPopup.Popup.Box key="right" ref="right" getItemKey={this.props.getItemKey} getItemView={this.props.getItemView} dataSource={this.selectionDataSource} excludeItems={[]} />
              </div>
            </div>
          </div>
        </div>
      </div>
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

AutoCompleteWithPopup.Popup.Box = React.createClass({
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
      <div>
        <div className="filter">
          <ThrottledInput onChange={this.onFilterKeyChange} value={this.state.filter.key} />
        </div>
        <DataViewer ref="viewer" viewFactory={this.viewFactory} dataSource={this.props.dataSource} filter={this.state.filter} />
      </div>
    );
  },
  viewFactory: function(props){
    return (<PagedLoadingView ref="view" {...props} viewFactory={this.internalViewFactory} />);
  },
  internalViewFactory: function(props){
    return (<List ref="view" {...props} excludeItems={this.props.excludeItems} getItemKey={this.props.getItemKey} getItemView={this.props.getItemView} multiSelect={true} />);
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
