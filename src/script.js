window.onload = function(){    
    let exportButton = document.getElementById("export");    
    exportButton.disabled = true;    
    let errorDialogBox = document.getElementById("errorDialog");
    errorDialogBox.close();

    document.getElementById("inputFile").addEventListener("change", function(e){
      const fileExtension = this.files[0].name.split('.').pop();
      if(fileExtension.toLowerCase() != "har"){
        showError("Please select a HAR file");
      }
      else{
        exportButton.disabled = false;
      }
    });

    exportButton.addEventListener("click", function(e){      
      let inputFileElement = document.getElementById("inputFile");
      let selectedFile = inputFileElement.files[0];
      const downloadFileName = `${selectedFile.name}.csv`;
      let fileReader = new FileReader();
      fileReader.onload = function(e) {
          let harData = JSON.parse(fileReader.result);
          harToCsv(harData, downloadFileName);
      }
      fileReader.readAsText(selectedFile);
      exportButton.disabled = true;
      inputFileElement.value = "";
    });

    function harToCsv(harData, downloadFileName){
      //todo: HAR schema validator      
      if(harData.log && harData.log.entries){
        let csvRows = [];
        csvRows.push("Name,Method,Status,Type,Size,Time");
        harData.log.entries.forEach(function(element) {
          let urlParts = element.request.url.split('/');
          let name = urlParts.pop() || urlParts.pop();
          let row = `"${name}",${element.request.method},${element.response.status},${element.response.content.mimeType},${element.response.content.size} B,${element.time} ms`;
          csvRows.push(row);
        });

        let blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", downloadFileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      else{
        showError("Invalid HAR File")
      }
    }

    function showError(message){
      errorDialogBox.showModal();
      document.getElementById("errorMessage").innerHTML = message;
      document.getElementById("inputFile").value = "";
    }
}