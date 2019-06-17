var csvData = [];

// Contains the filters in the order they were added.
// Exist as objects to denote further instructions based on the filter
// Structure of the children:
//   { index: <integer>, type: <"equals"/"contains">, value: <string> }
var filters = [];
var searchFilter = undefined;

// Defines which columns of the .csv to render, based on index.
// For changes to update must call updateTable().
var colsToShow = [...Array(50).keys()];

// Keeps track of the most recent sort so sorting again will do
// the opposite. By default, the .csv is not sorted, so it starts at -1.
var lastSort = -1;
var sortDir = true;

// Called when document loads; does all initial processing and setting
// up of event handlers.
$(document).ready(function() {
    // File select module
    $('#csvupload').on('change', function(event) {
        var reader = new FileReader();
        reader.onload = (function(reader)
        {
            return function()
            {
                var contents = reader.result;
                csvData = contents.trim().split('\n');

                //////
                for (let i = 0; i < csvData.length; i++) {
                    csvData[i] = csvData[i].split(', ');
                }
                colsToShow = [...Array(50).keys()];
                updateFilters();
                updateFilterCounts();
                updateTable();
            }
        })(reader);
        reader.readAsText(event.target.files[0]);
    });

    // Called whenever the checkbox for a filter is clicked
    $('#filters').on('change', ':checkbox', function() {
        if ($(this).prop('checked')) {
            $('#filterCustom' + $(this).val()).css('display', 'flex');
            filters.push({
                'index': parseInt($(this).val()),
                'type': $('#filterType' + $(this).val()).val(),
                'value': $('#filterVal' + $(this).val()).val()
            })
        } else {
            $('#filterCustom' + $(this).val()).css('display', 'none');
            for (let i = 0; i < filters.length; i++) {
                if (filters[i]['index'] == parseInt($(this).val())) {
                    filters.splice(i, 1);
                    break;
                }
            }
        }
        updateFilterCounts();
        updateTable();
    });

    // Called whenever the search filter is applied
    $('#applySearch').on('change', function() {
        if ($(this).prop('checked')) {
            searchFilter = $('#searchText').val();
        } else {
            searchFilter = undefined;
        }
        updateFilterCounts();
        updateTable();
    });

    // Called whenever the search value changes
    $('#searchText').on('change', function() {
        if (!$('#applySearch').prop('checked')) {
            $('#applySearch').prop('checked', true);
            searchFilter = $('#searchText').val();
        }

        if (searchFilter != undefined) {
            searchFilter = $('#searchText').val();
            updateFilterCounts();
            updateTable();
        }
    });

    // Called whenever the type of a filter changes
    $('#filters').on('change', '.filteroption', function(){
        for (let i = 0; i < filters.length; i++) {
            if (filters[i]['index'] == parseInt($(this).attr('id').substr(10))) {
                filters[i]['type'] = $(this).val();
                break;
            }
        }
        updateFilterCounts();
        updateTable();
    });

    // Called whenever the value in a filter changes
    $('#filters').on('change', '.filterval', function() {
        for (let i = 0; i < filters.length; i++) { 
            if (filters[i]['index'] == parseInt($(this).attr('id').substr(9))) {
                filters[i]['value'] = $(this).val();
                break;
            }
        }
        updateFilterCounts();
        updateTable();
    });
});

// Deletes the column with the given ID
function deleteColumn(number) {
    for (let i = 0; i < colsToShow.length; i++) {
        if (colsToShow[i] == number) {
            colsToShow.splice(i, 1);
            break;
        }
    }
    lastSort = -1;
    sortDir = true;
    updateTable();
}

// Adds the column with the given ID
function addColumn() {
    colsToShow.push(parseInt($('#columnToAdd option:selected').val().substr(3)));
    updateTable();
}

// Updates the filters column on the left
function updateFilters() {
    $('#filters').empty();
    $('#columnToAdd').empty();
	for (let i = 0; i < csvData[0].length; i++) {
        let li = document.createElement("li");
        let op = document.createElement("option");

        li.innerHTML = '<input type="checkbox" value="' + i + '">(<span id="count' + i + '">?</span>) ' + csvData[0][i].trim() + '<div id="filterCustom' + i + '" style="margin-left: 10px; display: none"><select class="filteroption" id="filterType' + i + '"><option value="equals" selected>EQUALS</option><option value="contains">CONTAINS</option><input type="text" class="filterval" id="filterVal' + i + '"value="true" style="width: 50px; margin-left: 6px;"></div>';
        op.innerHTML = csvData[0][i];
        op.setAttribute("value", "col" + i);
        li.setAttribute("id", csvData[0][i] + '_li')
        document.getElementById("filters").appendChild(li);
        document.getElementById("columnToAdd").appendChild(op);
    }
}

// Updates the filter counts
function updateFilterCounts() {
    for (let i = 0; i < csvData[0].length; i++) {
        // Tally up how many of the values are true to display
        let count = 0;
        for (let j = 1; j < csvData.length; j++) {
            if (passesFilter(csvData[j])) {
                if (csvData[j][i].trim() == 'true') {
                    count++;
                }
            }
        }

        $('#count' + i).text(count);
    }
}

// Sorts the table based on the header clicked
function sortTable(byCol) {
    // Find out which column is actually the one being sorted by
    byCol = colsToShow.indexOf(byCol);
    var rows, i, first, second, shouldSwitch;
    var table = document.getElementById('tableitself');
    var switching = true;
    // Continue until no more switching required
    while (switching) {
        switching = false;
        rows = table.rows;
        // Loop through all the rows
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            first = rows[i].getElementsByTagName("TD")[byCol];
            if (first == undefined) {
                console.log(i)
                console.log(rows[i].getElementsByTagName("TD"));
                console.log(byCol);
            }
            second = rows[i + 1].getElementsByTagName("TD")[byCol];
            // Reverse the sort if necessary
            if (lastSort == byCol && !sortDir) {
                if (first.innerHTML.toLowerCase() < second.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (first.innerHTML.toLowerCase() > second.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
            switching = true;
        }
    }
    lastSort = byCol;
    sortDir = !sortDir;
}

// Downloads the current table as a .csv itself
function download() {
    let csv = '';

    var rows = $('#tableitself tr');
    let headers = $(rows[0]).children('th');
    for (let i = 0; i < headers.length; i++) {
        csv += $(headers[i]).text().slice(0, -1) + ',';
    }
    csv = csv.slice(0, -1) + '\n';

    for (let i = 1; i < rows.length; i++) {
        let childs = $(rows[i]).children('td');
        for (let j = 0; j < childs.length - 1; j++) {
            csv += childs[j].innerHTML + ',';
        }
        csv += childs[childs.length - 1].innerHTML + '\n';
    }
    csv.slice(0, -1);

    console.log(csv);

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,'  + encodeURIComponent(csv));
    element.setAttribute('download', $('#csvupload').val().substr(12));

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}

// Checks if a given row passes the filter
function passesFilter(row) {
    let passesFilter = true;
    filters.forEach((filter) => {
        // Currently two cases: "equals" and "contains"
        if (filter['type'] == 'equals') {
            if (row[filter['index']].trim() != filter['value']) {
                passesFilter = false;
            }
        } else if (filter['type'] == 'contains') {
            if (!row[filter['index']].includes(filter['value'])) {
                passesFilter = false;
            }
        }
    })

    // Also must handle the search filter on all potential columns
    // To pass, there must be a column containing the search param
    if (searchFilter != undefined && passesFilter) {
        passesFilter = false;
        for (let j = 0; j < row.length; j++) {
            if (row[j].includes(searchFilter)) {
                passesFilter = true;
                break;
            }
        }
    }

    return passesFilter
}

// Updates the main CSV table display
function updateTable() {
    $('#tablehead').empty();
    $('#tabledisplay').empty();
    let count = 0;
    for (let i = 0; i < csvData.length; i++) {
        if (i == 0 || passesFilter(csvData[i])) {
           let tr = document.createElement("tr");
           for (let k = 0; k < colsToShow.length; k++) {
                if (colsToShow[k] < csvData[0].length) {
                    let th;
                    // If the header column, also add the column delete button
                    if (i == 0) {
                        th = document.createElement("th");
                        th.innerHTML = '<a onclick="sortTable(' + colsToShow[k] + ')">' + csvData[i][colsToShow[k]] + '</a><button class="deletecolumn" onClick="deleteColumn(' + colsToShow[k] + ');" id="deleteCol' + colsToShow[k] + '">x</button>';
                    } else {
                        th = document.createElement("td");
                        th.innerHTML = csvData[i][colsToShow[k]];
                        // If it is true, make the color of it green
                        if (th.innerHTML.trim() == 'true') {
                            th.setAttribute("style", "background-color: #77DD77;")
                        }
                    }
                    tr.appendChild(th);
                } else {
                    colsToShow.splice(k, 1);
                    k--;
                }
           }

            if (i == 0) {
                document.getElementById('tablehead').appendChild(tr);
            } else {
                document.getElementById('tabledisplay').appendChild(tr);
            } 
            count++;
        }
    }
    $('#actualNumRows').text(count - 1);
}