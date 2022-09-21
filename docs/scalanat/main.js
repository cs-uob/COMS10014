function compileProof() {
    var source = editor.getValue();
    var result = runProof(source);

    var resultSuccess = document.getElementById("resultSuccess");
    if (result.success) {
        resultSuccess.innerHTML = "Proof ran successfully."
        resultSuccess.classList = ["success"];
    } else {
        resultSuccess.innerHTML = "Error running proof."
        resultSuccess.classList = ["error"];
    }

    document.getElementById("resultMessage").innerHTML = result.message;

    var resultTrace = document.getElementById("resultTrace")
    resultTrace.innerHTML = "";
    var trh = document.createElement("h2");
    trh.textContent = "Execution trace";
    resultTrace.appendChild(trh);
    
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    for (var i = 0; i < result.traceLength(); i++) {
        var row = document.createElement("tr");
        var lineNo = document.createElement("td");
        lineNo.classList = ["lineNumber"];
        lineNo.textContent = result.traceLine(i);
        var lineTerm = document.createElement("td");
        lineTerm.textContent = result.traceValue(i);
        row.appendChild(lineNo);
        row.appendChild(lineTerm);
        tbody.appendChild(row);
    }
    resultTrace.appendChild(table);
}

var editor = ace.edit("editor", {
    minLines: 30,
    maxLines: 30
});
editor.session.setMode("ace/mode/natural");
editor.resize();
