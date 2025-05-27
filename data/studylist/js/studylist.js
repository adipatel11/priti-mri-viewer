VIEWER_URL = 'data/viewer/viewer.html'

// Populate the study list
function addStudiesToTable() {
  var tableBody = $('#studyTableBody')

  for (var i = 0; i < studyrows.length; i++) {
    var row = buildStudyRow(i, studyrows[i])

    tableBody.append(row)
  }
}

// Build a table row for the given row number and dictionary
function buildStudyRow(rowID, rowData) {
  var row = $('<tr data-row-id="' + rowID + '">')
  var tdBtn = $('<td>')
  var tdPname = $('<td>' + rowData['pname'] + '</td>')
  var tdSex = $('<td>' + rowData['sex'] + '</td>')
  var tdPid = $('<td>' + rowData['pid'] + '</td>')
  var tdRcvd = $('<td>' + rowData['received'] + '</td>')
  var tdSdate = $('<td>' + rowData['sdate'] + '</td>')
  var tdModality = $('<td>' + rowData['modality'] + '</td>')
  var tdRefPhys = $('<td>' + rowData['refphys'] + '</td>')
  var tdImages = $('<td>' + rowData['numimages'] + '</td>')
  var tdSdesc = $('<td>' + rowData['sdesc'] + '</td>')
  var checkbox = $('<input type="checkbox" data-row-id="' + rowID + '">')

  row.append(tdBtn)
  tdBtn.append(checkbox)
  row.append(tdPname)
  row.append(tdSex)
  row.append(tdPid)
  row.append(tdRcvd)
  row.append(tdSdate)
  row.append(tdModality)
  row.append(tdRefPhys)
  row.append(tdImages)
  row.append(tdSdesc)

  row.click(rowClicked)
  checkbox.change(checkboxChanged)
  checkbox.click(function (event) {
      event.stopPropagation()
  }) 

  return row
}

// Event handler called when any row's checkbox changes
function checkboxChanged() {
  if ($('input:checked').length == 0) {
    $('#viewSelected').attr("disabled", true)
  }
  else {
    $('#viewSelected').removeAttr("disabled")
  }
}

// Event handler called when the select-all checkbox is changed
function selectAllChanged() {
  $('input:checkbox').not(this).prop('checked', this.checked)
  checkboxChanged() 
}

// Event handler called when a row is clicked
function rowClicked() {
  var rowID = $(this).closest('tr').data('row-id')
  var streamID = studyrows[rowID]['streamID']
  var siuid = studyrows[rowID]['siuid']

  openViewerURL([[streamID, siuid]])
}
 
// Open the currently selected studies in a new viewer tab 
function viewSelected() {
  var studyLocs = $('#studyTableBody').find('input:checked').map(function() {
    var rowID = $(this).data('row-id')
    var row = studyrows[rowID];
    
    return [[row['streamID'], row['siuid']]]
  }).get()

  openViewerURL(studyLocs)
}

// Open all studies in a new viewer tab
function viewAll() {
  var siuids = []

  studyrows.forEach(function extractID(value) {
    siuids.push([value['streamID'], value['siuid']])
  })
 
  openViewerURL(siuids)
}

// Open the specified studies in a new viewer tab
// studyLocs is a list of [streamID, siuid] pairs
function openViewerURL(studyLocs) {
  var studyIDs = []
  
  studyLocs.forEach(function buildStudyID(studyLoc) {
    streamID = studyLoc[0]
    siuid = studyLoc[1]
    studyIDs.push(streamID + "-" + siuid)
  })

  var url = VIEWER_URL + '?study=' + studyIDs[0] + '&addStudies=' 

  for (i = 1; i < studyIDs.length; i++) {
    url += studyIDs[i] + ','
  }

  window.open(url, '_blank')
}

