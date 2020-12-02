// Alteryx Gallery API

//setup your Gallery
// Alteryx Gallery API

//setup your Gallery
const setupGallery = function(){
  const galleryUrl = "" //"your_gallery_api_url";
  const galleryKey = "" //"your_gallery_api_key";
  const gallerySecret = "" //"your_gallery_api_secret";
  const gallery = new Gallery(galleryUrl, galleryKey, gallerySecret);
  return gallery;
}

//SECOND GALLERY CONSTRUCT REQUIRED AS POST FILES AND EXECUTING FILE STATEMENTS ONLY EXIST IN V2

const setupGallery2 = function(){
  const galleryUrl = "" //"your_gallery_api_url";  (NOTE FOR INPUTFILES NEED /user/v2
  const galleryKey = "" //"your_gallery_api_key";
  const gallerySecret = "" //"your_gallery_api_secret";
  const gallery = new Gallery(galleryUrl, galleryKey, gallerySecret);
  return gallery;
}

//Define a function to run the workflow

let runWorkflow = function(workflowID,questions, gallery) {
  return new Promise(function (fulfill, reject){
    gallery.executeWorkflow('WORKFLOW ID HERE', questions, function(resp){   //INSERT THE ID OF YOUR WORKFLOW IN THE FIRST PARAM
      if (resp.status === 'Queued') {
        fulfill(resp);
      } else {
        reject(resp);
      }
    });
  });
}

// Define a function to grab the status of the job

let getWorkflowStatus = function(jobId, gallery, callback) {
  gallery.getJob(jobId, function(response) {
    //get the jobID of the workflow
    callback(response);
  });
}


// Define a function to check the status of the workflow

let checkWorkflowStatus = function(jobId, gallery, callback) {
  const inputQuestion = $('#appInterface').val()
  let noteUser = 'Workflow running for ' + inputQuestion
  $('#output').html(noteUser)
  $('#output').show();
  getWorkflowStatus(jobId, gallery, function(resp){
    if (resp.status != "Queued" && resp.status != "Running") {
      callback(jobId, resp);
    } else {
      setTimeout(function () {
        checkWorkflowStatus(jobId, gallery, callback);
      }, 2000);
    }
  });
}
// Define a function to get the app Questions
var appInterface = function(workflowID, gallery) {
  gallery.getAppQuestions(workflowID, function(questions){
    // just getting the first question -- define a for loop if you want to grab all
    // the description is the label of the interface tool
    console.log(questions[0].description);
 });
};

//run a workflow

var ajaxresult=[];  //Global variable to store the result of the ID from file posting


$(document).ready(function(){
  $('#executeWorkflow').on('click', function(){
    if (!ajaxresult || !ajaxresult.length) {
    // array or array.length are false
    // ⇒ do not attempt to process array
    alert("Please upload file first")

    }
    else
    {
    const gallery = setupGallery();
    const gallery2 = setupGallery2();  //second gallery construct
    const workflowID = 'WORKFLOW ID HERE';// HERE IS THE SECOND SPOT FOR WORKFLOW ID
    const questions = $("#appInterface").serializeArray();
    console.log(questions);
   // gallery.getAppQuestions(workflowID, function(questions){
     // var listStr = "<table>";

      //listStr += '<tr><td class="name"></td><td><input type="text" class="form-control" value="' + (question.value || '') + '" name="' + question.name + '" placeholder="placeholder_for_your_app_question">';
    //});
    
    let file = {
       "value": ajaxresult[0].resp.replace(/^"(.*)"$/, '$1'),   //remove the extra quotes - i know should push an object here instead of a string but couldnt figure out how
       "name": "File Browse"  //enter in the name of your file browse tool from the workflow
      };
    questions.push(file);  //pushes the file browse portion into the questions array 
    console.log(questions);
    runWorkflow(workflowID, questions, gallery2)
    .then(function responseWorkflow(resp){
      console.log('Workflow is Running');
      checkWorkflowStatus(resp.id,gallery, function(jobID, resp){
        if (resp.status === 'Completed' && resp.outputs.length > 0) {
          const inputQuestionComplete = $('#appInterface').val();
          let finishedNote = 'Workflow Completed for ' + inputQuestionComplete;
          $('#output').html(finishedNote);
          console.log('Workflow Finished Running');
          const link = gallery.getOutputFileURL(jobID,resp.outputs[0].id,"Raw");
          const downloadFile = '<a href='+link+'>Download File</a>';
          $('#outputFile').html(downloadFile);
        } else if (resp.status === 'Completed' && resp.disposition === 'Error') {
          $('#output').html('Error, there is something wrong with your workflow');
        }
      });
    });
    }
   });
   
});

//function to call the file posting 

let postaFile = function(gallery,file) {
  new Promise(function (fulfill, reject){
   gallery.postFile(file, function(resp) {
      if (resp.status != 'Queued') {
        fulfill(resp);
      } else {
        reject(resp);
      }
      
   ajaxresult.push({resp});   //push the API response into global variable ajaxresult
   });
   
 });
    
};

$(document).ready(function(){
//response from the upload form
    $("#but_upload").click(function(){
        
        var fd = new FormData();
        var files = $('#file')[0].files;
        
        // Check file selected or not
        if(files.length > 0 ){
           fd.append('inputFile',files[0]);
           const gallery = setupGallery2();
           postaFile(gallery,fd);
           let filemessage = 'File uploaded with ID '+ajaxresult[0].resp.replace(/^"(.*)"$/, '$1');
           $('#output').html(filemessage);
           }
        else{
           alert("Please select a file.");
        }
        
        
    });
});

