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

d3.text('concerts.csv', function(text) {
  concertData = d3.csv.parseRows(text, parseRow).slice(1)
  console.log(concertData);
});