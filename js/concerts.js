function parseDate(dateString) {
  parts = dateString.split('/');
  // month, day, year -- note months are zero based
  return new Date(parts[2], parts[0] - 1, parts[1])
}

function parseRow(row) {
  return {
    date: parseDate(row[1]),
    venue: row[2],
    city: row[3],
    country: row[4],
    bands: row.slice(6).filter(function(band) { return band != '';}),
    complete: row[0] != '',
  }
}

concertData = {}
concertBarChart = {}

d3.text('concerts.csv', function(text) {
  concertData = d3.csv.parseRows(text, parseRow).slice(1)
  console.log(concertData);
  concertBarChart = new BarChart(concertData)
  concertBarChart.selectKey('bands')
});


function BarChart(data) {
  this.rawData = data;
  this.barData = {};
  this.textSize = 200;
  this.height = 1500;
  this.width = 800;
  this.y = d3.scale.ordinal()
        .rangeRoundBands([this.height, 0], .1);
  this.x = d3.scale.linear()
        .range([0, this.width - this.textSize]);
}

BarChart.prototype.selectKey = function(key) {
  barMap = this.rawData.reduce(function(barDataOut, row) {
    function addItem(item) {
      if (item == '') {
        return barDataOut;
      }
      if (item in barDataOut) {
        barDataOut[item] += 1;
      } else {
        barDataOut[item] = 1;
      }
    }

    item = row[key];
    if( Object.prototype.toString.call( item ) === '[object Array]' ) {
      item.map(addItem);
    } else {
      addItem(item);
    }
    return barDataOut;
  }, {});

  console.log(barMap)

  this.barData = []
  for (var key in barMap) {
    if (barMap.hasOwnProperty(key)) {
      this.barData.push({'key':key, 'value':barMap[key]})
    }
  }

  this.barData = this.barData.sort(function(a, b) { return d3.ascending(a.value, b.value); })

  this.y.domain(this.barData.map(function(d) { return d.key; }));
  this.x.domain([0, d3.max(this.barData, function(d) { return d.value; })]);

  console.log(this.barData)

  this.drawGraph();
}

BarChart.prototype.drawGraph = function() {
  var svg = d3.selectAll("#concertChart")
    .datum(this.barData)
    .attr("width", this.width)
    .attr("height", this.height);

  x = this.x;
  y = this.y;
  width = this.width;
  height = this.height;

  bars = svg.selectAll("g")
    .data(this.barData)
    .enter()
      .append("g")
      .attr("transform", function(d) {
        return "translate(0, " + y(d.key) + ")";
      });

  bars.append("rect")
    .attr("height", y.rangeBand())
    .attr("width", function(d) { 
      console.log(d);
      console.log(width);
      console.log(x(d.value));
      return x(d.value); 
    })
    .attr("x", this.textSize);

  bars.append("text")
    .text(function(d) {return d.key; });
}