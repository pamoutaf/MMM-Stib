Module.register("MMM-Stib", {
	expectedArrivalTimes: [],
  
	getDom: function () { //create the different cells
	  var wrapper = document.createElement("div");
  
	  var table = document.createElement("table");
	  table.className = "stib-table small";
  
	  this.expectedArrivalTimes.forEach(entry => {
		var row = document.createElement("tr");
		
		var lineIDCell = document.createElement("td");
		lineIDCell.className = `lineID ${entry.lineId} - ${entry.direction}`;
		lineIDCell.innerHTML = entry.lineId;
		row.appendChild(lineIDCell);
	
		
		var stopCell = document.createElement("td");
		stopCell.className = "direction";
		stopCell.innerHTML = entry.direction;
		row.appendChild(stopCell);

		var dynamicClassName = entry.direction.replace(/\s+/g, '').toLowerCase();
	    stopCell.classList.add(dynamicClassName);
		console.log("Dynamic Class Name:", dynamicClassName);

		var etaCell = document.createElement("td");
		etaCell.className = "estimated-time-arrival";
		etaCell.innerHTML = "";
		row.appendChild(etaCell);
  
		var diffCell = document.createElement("td");
		diffCell.className = "time-difference";
		diffCell.innerHTML = entry.timeDifference + " min";
		row.appendChild(diffCell);
  
		table.appendChild(row);
	  });
	  wrapper.appendChild(table);
  
	  return wrapper;
	},
  
	processData: function (station, expectedArrivalTime, lineid) { //store data from the fetch function
	  var entry = {
		direction: station.direction,
		expectedArrivalTime: expectedArrivalTime,
		timeDifference: 0,
		lineId: lineid,
	  };
	  var date = new Date();
	  var time = date.getMinutes();
	  entry.timeDifference = entry.expectedArrivalTime - time; // gets the eta of bus/tram
  
	  this.expectedArrivalTimes.push(entry);
	},
  
	fetchBusData: function () {
	  const self = this;
	  const promises = [];
  
	  this.expectedArrivalTimes = [];
  
	  this.config.station.forEach(station => {
		const pointId = station.pointid;
		const apiToken = self.config.apiToken;
		const apiUrl = `https://stibmivb.opendatasoft.com/api/explore/v2.1/catalog/datasets/waiting-time-rt-production/records?select=passingtimes%2C%20pointid&where=pointid%20%3D%20${pointId}&limit=20&apikey=${apiToken}`;
  
		const promise = fetch(apiUrl)
		  .then(response => {
			if (!response.ok) {
			  throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.json();
		  })
		  .then(data => {
			const resultsArray = data.results;
			const result = resultsArray[0];
			console.log("print result:",result)
			const passingTimesArray = JSON.parse(result.passingtimes);
			const sanitize_input = passingTimesArray.map(item => item.expectedArrivalTime);
			const real_time_bus = sanitize_input.slice(0, 1);
			const d = new Date(real_time_bus);
			const expectedArrivalTime = d.getMinutes();
			//console.log("results array", result)
			//console.log("Testing arrival time",expectedArrivalTime)
			const lineid = [... new Set(passingTimesArray.map(item => item.lineId))];
			console.log("line id is:", lineid);
			self.processData(station, expectedArrivalTime, lineid);
			self.updateDom();
		})
		.catch(error => {
			console.error('Error:', error);
		});
		
	  });
	},
  
	getStyles: function () {
	  return ["stib.css"];
	},
  
	getHeader: function () {
	  return "MMM-Stib";
	},
  
	start: function () {
	  const self = this;
	  self.fetchBusData();
	  setInterval(function () {
		self.fetchBusData();
	  }, 15000);
	},
  });
  
