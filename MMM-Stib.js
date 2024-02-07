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
		
		// time diff 1
		var diffCell = document.createElement("td");
		diffCell.className = "time-difference";
		diffCell.innerHTML = entry.timeDifference + " min";
		row.appendChild(diffCell);

		// time diff 2
		var diffCell2 = document.createElement("td");
		diffCell2.className = "time-difference2";
		diffCell2.innerHTML = entry.timeDifference2 + " min";
		row.appendChild(diffCell2);
  
		table.appendChild(row);
	  });
	  wrapper.appendChild(table);
  
	  return wrapper;
	},
  
	processData: function (station, expectedArrivalTime, expectedArrivalTime2, lineid) { //store data from the fetch function
	  var entry = {
		direction: station.direction,
		expectedArrivalTime: expectedArrivalTime,
		expectedArrivalTime2: expectedArrivalTime2,
		timeDifference: 0,
		timeDifference2: 0,
		lineId: lineid,
	  };
	  var date = new Date();
	  var time = date.getMinutes();
	  entry.timeDifference = entry.expectedArrivalTime - time; // gets the eta of bus/tram
	  entry.timeDifference2 = entry.expectedArrivalTime2 - time; // gets the second eta of bus/tram
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
			const real_time_bus = passingTimesArray[0].expectedArrivalTime; //first time of arrival
			const real_time_bus2 = passingTimesArray[1].expectedArrivalTime; //second time of arrival
			
			// Set time for bus arrival times
			const d = new Date(real_time_bus);
			const d2 = new Date(real_time_bus2);
			const expectedArrivalTime = d.getMinutes();
			const expectedArrivalTime2 = d2.getMinutes();

			const lineid = [... new Set(passingTimesArray.map(item => item.lineId))];
			self.processData(station, expectedArrivalTime, expectedArrivalTime2, lineid);
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
  