var browserPort = require("browser-serialport");
var maxDataPoints = 500;

// ------- chart functions
function init() {
	var ctx = document.getElementById("line-chart");
	dataPlot = new Chart(ctx, {
		type: 'line',
		data: {
			datasets: [{
				data: [],
				label: "PPG wave",
				borderColor: "#58e01d",
				backgroundColor: "#58e01d",
				fill: false
			}]
		},
		options: {
			elements: {
				point: {
					radius: 0
				}
			},
			scales: {
				xAxes: [{
					gridLines: {
						display: false
					},
					ticks: {
						display: false //this will remove only the label
					}
				}],
				yAxes: [{
					gridLines: {
						display: false
					}
				}]
			}
		},

	});
	//--- close usbport while exit
	window.onunload = function () {
		serialPort.close();
	}
}

setDatatoChart = function (stringData) {
	var today = new Date();
	var t = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	addData(t, stringData);
}

function addData(label, data) {
	if (dataPlot.data.labels.length > maxDataPoints) removeData();
	dataPlot.data.labels.push(label);
	dataPlot.data.datasets[0].data.push(data);
	dataPlot.update();
}

function removeData() {
	dataPlot.data.labels.shift();
	dataPlot.data.datasets[0].data.shift();
}
// ------- END chart functions

function getAvailableUSBports() {
	var ele = document.getElementById("usbports");
	// ---------- remove ports
	var numofports = ele.options.length;
	for (i = numofports - 1; i > 0; i--) {
		ele.option[i] = null;
	}
	// ---------- add ports
	browserPort.list(function (err, ports) {
		ports.forEach(function (port) {
			//console.log(port.comName+" - "+port.pnpId+" - "+port.manufacturer);
			console.log(port.comName.toString());
			if (port.manufacturer != undefined) {
				var option = document.createElement("option");
				option.text = port.comName;
				ele.add(option);
			}
		});
	});
}

function initiateGraph() {
	var serialData = "";
	var e = document.getElementById("usbports");
	var port = e.options[e.selectedIndex].text; // "/dev/ttyUSB0"
	console.log("selected port is" + port);
	var SerialPort = browserPort.SerialPort;
	var serialPort = new SerialPort(port, {
		baudrate: 9600
	});

	serialPort.on("open", function () {
		console.log('open');
		serialPort.on('data', function (data) {
			if ((String(data).charCodeAt(0) == 13 || String(data).charCodeAt(0) == 10) && (serialData != "")) {
				if (parseInt(serialData) > 500) {
					setDatatoChart(serialData);
					serialData = "";
				}
			} else {
				serialData = serialData.concat(String(data));
			}
		});
		serialPort.write("ls\n", function (err, results) {
			console.log('err ' + err);
			console.log('results ' + JSON.stringify(results));
		});
	});
}
