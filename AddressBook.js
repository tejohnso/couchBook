function fetchData(tableName){
	var req=new XMLHttpRequest();
	var docs;
	req.open("GET", "/"+tableName+"/_all_docs?include_docs=true&descending=true",false);
	req.send("");
	return JSON.parse(req.responseText).rows;
}

function populateTable(tableElement,columnNames,includeHeader){
	var newRow;
	var newColumn;
	var newColumnText;
	var dataTuple={};
	var dataCurrentRow=0;
	var dataSet=fetchData('people');
	var dataLength=dataSet.length;

	while (tableElement.firstChild) {
  		tableElement.removeChild(tableElement.firstChild);
	}

	if(includeHeader){
		var colCount=columnNames.length;
		for (var j=0;j<colCount;j+=1) {
			dataTuple[columnNames[j]]=columnNames[j];
		}
		populateRow(dataTuple,'th');
	}

	for (dataCurrentIndex=0;dataCurrentIndex<dataLength;dataCurrentIndex+=1) {
		dataTuple=dataSet[dataCurrentIndex].doc;
		populateRow(dataTuple,'td');
	}

	function populateRow(rowTuple,columnType){
		newRow=window.document.createElement('tr');
		for (var j=0,k=columnNames.length;j<k;j+=1) {
			newColumn=window.document.createElement(columnType);
			newColumnText=window.document.createTextNode(rowTuple[columnNames[j]]);
			newColumn.appendChild(newColumnText);
			newRow.appendChild(newColumn);
		}

		tableElement.appendChild(newRow);
	}
}

var tableArguments=[window.document.getElementById('people'),['_id','first','last','email'],true];
populateTable.apply(null,tableArguments);

window.document.getElementById('people').addEventListener('click',showRowDetail,false);
//window.document.getElementById('peopleHeading').addEventListener('mousedown',handleDrag,false);
//window.document.getElementById('peopleHeading').addEventListener('mouseup',handleDrag,false)

function showRowDetail(e) {
	if (e.target.tagName=='TH') {return;}

	var fullRowData={};
	var detailParagraph,detailKey,detailValue;
	
	var targetRow=e.target;	
	if (targetRow.tagName=='TD') {targetRow=targetRow.parentNode;}
	
	var newWindow=document.createElement('div');
	newWindow.className='detailFrame';
	newWindow.id=targetRow.firstElementChild.innerHTML;

	fullRowData=getFullRowData('people',targetRow.firstElementChild.innerHTML);

	for (key in fullRowData) {
		appendDetailRow(key);
	}

	addDetailButtons();

	window.document.body.appendChild(newWindow);

	function getFullRowData(tableName,key) {
		var req=new XMLHttpRequest();
		req.open("GET", "/"+tableName+"/"+key,false);
		req.send("");
		return JSON.parse(req.responseText);
	}

	function appendDetailRow(key){
		detailParagraph=document.createElement('p');
		detailKey=document.createElement('span');
		detailValue=document.createElement('span');
		detailKey.innerHTML=key;
		detailValue.innerHTML=fullRowData[key];
		detailValue.onclick=function(){editField(this);}
		detailParagraph.appendChild(detailKey);
		detailParagraph.appendChild(detailValue);
		newWindow.appendChild(detailParagraph);
	}

	function addDetailButtons(){
		var deleteButton=document.createElement('button');
		deleteButton.className='detailButton';
		deleteButton.innerHTML='delete';
	//	deleteButton.id=fullRowData['_id'];
		deleteButton.onclick=function(){deleteRecord('people',this.parentElement.id);this.parentElement.parentElement.removeChild(this.parentElement);}
		newWindow.appendChild(deleteButton);
		var closeButton=document.createElement('button');
		closeButton.className='detailButton';
		closeButton.innerHTML='close';
		closeButton.onclick=function(){this.parentElement.parentElement.removeChild(this.parentElement);}
		newWindow.appendChild(closeButton);
	}
}

function deleteRecord(tableName,id) {
	var req=new XMLHttpRequest();
	var doc;
	req.open("GET", "/"+tableName+"/"+id,false);
	req.send("");
	doc=JSON.parse(req.responseText);
	req.open("DELETE","/"+tableName+"/"+id+"?rev="+doc["_rev"],false);
	req.send("");
	populateTable.apply(null,tableArguments);
}

function addPerson() {
	var req=new XMLHttpRequest();
	var person={'first': 'first', 'last': 'last', 'email': 'email', 'posn': 'posn', 'grade': 'grade'};
	var uuid;
	req.open("GET", "/_uuids",false);
	req.send();
	uuid=JSON.parse(req.responseText).uuids[0];
	req.open("PUT", "/people/"+uuid,false);
	req.setRequestHeader("Content-Type","application/json");
	req.send(JSON.stringify(person));
	
	populateTable.apply(null,tableArguments);
}

function editField(el) {
	if (el.parentNode.children[0].innerHTML=='_id' || el.parentNode.children[0].innerHTML=='_rev') {return;}
	var newEl=document.createElement('input');
	var elParent=el.parentNode;
	newEl.type='text';
	newEl.value=el.innerHTML;
	elParent.removeChild(el);
	elParent.appendChild(newEl);
	newEl.focus();
	newEl.addEventListener('blur',saveEdit,true);
}

function saveEdit(event) {
	var el=event.target;
	var newEl=document.createElement('span');
	var parentEl=el.parentNode;
	this.removeEventListener('blur',saveEdit,true);
	newEl.innerHTML=el.value;
	newEl.onclick=function(){editField(this);}

	var req=new XMLHttpRequest();
	var doc;
	req.open("GET", "/people/"+el.parentNode.parentNode.id,false);
	req.send("");
	doc=JSON.parse(req.responseText);

	doc[el.previousElementSibling.innerHTML]=el.value;
	req.open("PUT", "/people/"+el.parentNode.parentNode.id,false);
	req.send(JSON.stringify(doc));

	parentEl.removeChild(el);
	parentEl.appendChild(newEl);
	populateTable.apply(null,tableArguments);
	event.stopPropagation();
}	

/*  To be continued when _changes supports eventsource

function startServerListener() {
	debugger;
	var svrListener = new EventSource("/people/_changes?feed=continuous&include_docs=true&heartbeat=10000");
	svrListener.onmessage = function(e) {  
		handleServerUpdate(e);
	}  
}

startServerListener();

function handleServerUpdate(e){
	debugger;
	var msgContainer=document.getElementById('serverMessages') || document.createElement('div');
	msgContainer.id='serverMessages';
	msgContainer.innerHTML=msgContainer.innerHTML+e.data;
}
*/
