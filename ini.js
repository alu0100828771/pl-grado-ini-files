"use strict"; // Use ECMAScript 5 strict mode in browsers that support it

$(document).ready(function() {
	if (window.localStorage && localStorage.initialinput && localStorage.finaloutput) {
	  out.className = 'unhidden';
	  initialinput.innerHTML = localStorage.initialinput;
	  finaloutput.innerHTML = localStorage.finaloutput;
	}
   //Drag and drop
   var dropZone = document.getElementById('dragdrop');
   dropZone.addEventListener('drop', handleFileSelect, false);
   //-------------
   $("#fileinput").change(calculate);
});

// main
function calculate(evt) {
  var f = evt.target.files[0]; 

  if (f) {
	var r = new FileReader();
	r.onload = function(e) { 
	  var contents = e.target.result;

	  var tokens = lexer(contents);
	  var pretty = tokensToString(tokens);

	  out.className = 'unhidden';
	  initialinput.innerHTML = contents;
	  finaloutput.innerHTML = pretty;

	  if (window.localStorage) {
		localStorage.initialinput = contents;
		localStorage.finaloutput = pretty;
	  }
	}
	r.readAsText(f);
  } else { 
	alert("Failed to load file");
  }
}

//Drag and drop
function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();


        var files = evt.dataTransfer.files; 

	var output = [];
    	for (var i = 0, f; f = files[i]; i++) {
		if (f) {
			var r = new FileReader();
			r.onload = function(e) { 
	  			var contents = e.target.result;

	 	 		var tokens = lexer(contents);
	  			var pretty = tokensToString(tokens);

	  			out.className = 'unhidden';
	  			initialinput.innerHTML = contents;
	  			finaloutput.innerHTML = pretty;

	  			if (window.localStorage) {
					localStorage.initialinput = contents;
					localStorage.finaloutput = pretty;
	  			}
			}
			r.readAsText(f);
			output.push(r);
  		} else { 
			alert("Failed to load file");
  		}
    	}
    	document.getElementById('finaloutput').innerHTML = '<ul>' + output.join('') + '</ul>';

	evt.target.style.background = "white";
    
}

function tokensToString(tokens) {
   var output_template = _.template(template_outList.innerHTML);
   var matches = [];
   
   for(var i in tokens) {
	 matches.push(JSON.stringify(tokens[i], undefined, 2));
   }
   
   return output_template({tokens: tokens, matches: matches}).substr(1); // El substr(1) Eliminar el \n generado por la plantilla.
}

function lexer(input) {
  var multiline      = /([^\\]*)\\/;
  var blanks		 = /^\s+/;
  var iniheader		 = /^\[([^\t\n]+)\](?=\s+)/;
  var comments		 = /^[;#](.*)/;
  var nameEqualValue = /^([^=;\r\n]+)=([^;\r\n]*)/;
  var anycontent     = /^\r\n(.*)/;
  var any			 = /^(.|\n)+/;

  var out = [];
  var m = null;

  while (input != '') {
	if (m = blanks.exec(input)) {
	  input = input.substr(m.index+m[0].length);
	  out.push({ type : 'blanks', match: m });
	}
	else if (m = iniheader.exec(input)) {
	  input = input.substr(m.index+m[0].length);
	  out.push({ type: 'header', match: m });
	}
	else if (m = comments.exec(input)) {
	  input = input.substr(m.index+m[0].length);
	  out.push({ type: 'comments', match: m });
	}
	else if (m = nameEqualValue.exec(input)) {
	  input = input.substr(m.index+m[0].length);

	  var m2;
	  while(m2 = multiline.exec(m[2]))
	  {
	    var nextline_match = anycontent.exec(input);
	    input = input.substr(nextline_match[0].length);

		m[2] = m2[1] + nextline_match[1];
		m[0] = m[0] + nextline_match[1];
	  }

	  out.push({ type: 'nameEqualValue', match: m });
	}
	else if (m = any.exec(input)) {
	  out.push({ type: 'error', match: m });
	  input = '';
	}
	else {
	  alert("Fatal Error!"+substr(input,0,20));
	  input = '';
	}
  }
  return out;
}

