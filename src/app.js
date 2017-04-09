const cb = new ClearBlade();
const initOptions = {
		URI : "https://platform.clearblade.com",
    messagingURI : "platform.clearblade.com",
    messagingPort: 8904,
    useMQTT: true,
    cleanSession: true,
    systemKey: "a289ac8e0bc0c5bdf0b6a0d08a57",
    systemSecret: "A289AC8E0B98A6B7B39DF0E3D0DF01",
    email: "test@clearblade.com",
    password: "clearblade",
}
cb.init(initOptions);

const App = React.createClass({
  getInitialState() {
    this._columns = [
      {
        key: 'id',
        name: 'ID',
        width: 80,
				resizable: true
      },
      {
        key: 'city',
        name: 'City',
        editable: true,
				resizable: true
      },
      {
        key: 'state',
        name: 'State',
        editable: true,
				resizable: true
      },
      {
        key: 'country',
        name: 'Country',
        editable: true,
				resizable: true
      },
      {
        key: 'temperature',
        name: 'Temperature',
        editable: true,
				resizable: true
      },
      {
        key: 'weather',
        name: 'Weather',
        editable: true,
				resizable: true
      },
    ];
    return { rows: [], showMe : false };
		return { select: [] };
  },

  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let rows = this.state.rows.slice();
    for (let i = fromRow; i <= toRow; i++) {
			let rowToUpdate = rows[i];
			let updatedRow = update(rowToUpdate, {$merge: updated});
			rows[i] = updatedRow;
			let query = cb.Query({collectionName: "Weather"});
			query.equalTo('item_id', String(rows[i]['id']));
			query.update(updated, function() { });
     	}
    this.setState({ rows });
  },

  createRows() {
    let rows = [];
    const query = cb.Query({collectionName: "Weather"});
    query.setPage(0,0);
    query.fetch(function(err, data){
      for (let i = 0; i < Object.keys(data).length; i++) {
        rows.push({
          id: data[i].data['item_id'],
          city: data[i].data['city'],
          state: data[i].data['state'],
          country: data[i].data['country'],
          temperature: data[i].data['temperature'],
          weather: data[i].data['weather'],
        });
      }
      this.setState({ rows });
    }.bind(this));
  },

  rowGetter(i) {
    return this.state.rows[i];
  },

  onClick() {
    this.createRows();
		this.setState({ showMe : true} );
  },

	handleDeleteRow() {
		const collection = cb.Collection({collectionName: "Weather"});
		console.log(this.state.select.length)
		let rows = this.state.rows.slice();
		for (let i = 0; i < this.state.select.length; i++) {
	    console.log(this.state.select[i]);
			let query = cb.Query({collectionName: "Weather"});
			query.equalTo('item_id', String(this.state.select[i]['id']));
			query.remove(function() { })
			let select = this.state.select[i]['id'];
			rows = rows.filter(function( obj ) {
				console.log(obj)
    		return obj['id'] !== select;
			})
			this.setState( { rows }, function () {
        let rows = this.state.rows.slice();
    	});
		}
	},

	onRowSelect(rows) {
		this.setState({ select: rows });
  },

	handleAddRow({ newRowIndex }) {
	const collection = cb.Collection({collectionName: "Weather"});
	const callback = function(err, data) {
	    console.log(data[0]['item_id']);
			newRow['id'] = data[0]['item_id'];
			let rows = this.state.rows.slice();
			rows = update(rows, {$push: [newRow]});
			this.setState({ rows });
		}.bind(this);
	collection.create(newRow, callback);
	const newRow = {
		id: null,
		city: '',
		state: '',
		country: '',
		temperature: null,
		weather: ''
		};
	},

  render: function() {
		let button = null;
		if (!this.state.showMe) {
			button =
			<button onClick={this.onClick} style={{
				height: 30,
				width: 320,
				marginTop: 10,
				fontSize: 14,
			}}>Generate Spreadsheet from Collection</button>
		} else {
			button =
			<div>
				<button onClick={this.handleAddRow} style={{
					height: 30,
					width: 260,
					marginTop: 10,
					marginRight: 10,
					fontSize: 14,
				}}>+ Add Row</button>
				<button onClick={this.handleDeleteRow} style={{
					height: 30,
					width: 260,
					marginTop: 10,
					marginLeft: 10,
					fontSize: 14,
				}}>Delete Selected Rows</button>
			</div>
		};
    return (
			<div style={{dropShadow: 30}}>
      	<div style={{
					background: '#282727',
					height: 140,
					textAlign: 'center',
				}}>
					<div style={{
						color: 'white',
						paddingTop: 10,
						fontSize: 46,
						fontWeight: 500,
					}}>ClearBlade Grid App
					</div>
					<div>
					{button}
					</div>
				</div>
      <ReactDataGrid
			  rowKey="id"
        enableCellSelect={true}
        columns={this._columns}
        rowGetter={this.rowGetter}
        rowsCount={this.state.rows.length}
        minHeight={600}
        onGridRowsUpdated={this.handleGridRowsUpdated}
				enableRowSelect="multi"
				onRowSelect={this.onRowSelect}
				/>
			</div>
    );
  }
});

ReactDOM.render(
  <App />,
  document.getElementById('grid-app')
);
