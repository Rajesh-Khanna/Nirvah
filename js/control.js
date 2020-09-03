// Client ID and API key from the Developer Console
var CLIENT_ID = '621924091062-g6br61idc5jha26ep6loda5fjlqt653o.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCdwhrZfx1i4MqFOizKLcKe6F3XErodkf0';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest", "https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'profile email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function makeSafe(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
ot = '';
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen(handleSignin);
    handleSignin(gapi.auth2.getAuthInstance().isSignedIn.get());
    
    if(authorizeButton)
      authorizeButton.onclick = handleAuthClick;
    if(signoutButton) 
      signoutButton.onclick = handleSignoutClick;
  }, function (error) {
    // appendPre(JSON.stringify(error, null, 2));
  });
}

function handleSignin(isSignedIn){
  var path = document.location.pathname;
  path = path.split('/');
  path = path[path.length-1];
  if(isSignedIn){
    if(path == "login.html"){
      console.log(1);
      location.replace('./index.html');
    }else{
      console.log(2);
      $(document).ready(loadMain());
    }
  }else{
    if(path == "login.html"){
      console.log(3);
    }else{
      console.log(4);
      location.replace('./login.html');
    }
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function openProjectPage(name){
  window.location.replace(window.location.origin+window.location.pathname+'?projectName='+name);
}

function createNew_project(){
  var id = '#newProjctName';
  if(/\S/.test($(id).val()) && /^[a-z0-9]+$/i.test($(id).val())){
    Project.createProject($(id).val());
    $(id).val('');
  }else{
    alert('Project Name cannot be empty and should have only alphanumeric characters');
  }
}

function DisplayUserInfo(name,image,email){
  $('#profile_img').attr('src',image);
  $('#profile_name').text(name);
}

function updateInfo(){
  var codeLink = makeSafe($('#edit_project_code').val());
  var downloadLink = makeSafe($('#edit_project_download').val());
  var demoLink = makeSafe($('#edit_project_demo').val());
  var description = makeSafe($('#edit_project_description').val());
  Project.updateProject(codeLink,downloadLink,demoLink,description);  
}

function loadMain(){
  console.log('entered');
  googleUser = gapi.auth2.getAuthInstance().currentUser;
  userName = googleUser.get().getBasicProfile().getName(); 
  userImage = googleUser.get().getBasicProfile().getImageUrl(); 
  userEmail = googleUser.get().getBasicProfile().getEmail(); 
  
  DisplayUserInfo(userName,userImage,userEmail);

  if (typeof Model === 'function'){
    user = new User();
    console.log('model next line');
  }

}

function addNewTask(){
  if(/\S/.test($('#task-input').val())){
    Task.addTask(makeSafe($('#task-input').val()));
    $('#task-input').val('');
  }else{
    alert('task cannot be empty');
  }
}

function deleteTask(id){
  if(confirm("Are you sure you want to delete this task:"+Task.rawData.values[id][2])){
    Task.removeTask(id);
  }
}

function displayAppendTask(group,statement,id){
  console.log(id);
  $('#'+group+'_table').append('<li id="task_'+id+'" class="list-group-item ui-state-default task_el btn btn-icon-split"> \
    <span class="text mr-auto">'+statement+'</span>      \
    <span class="icon float-right pt-auto pb-auto bg-danger text-light" onclick = deleteTask('+id+')> \
    <i class="fa fa-times"></i> \
    </span> \
  </li>');
}

function displayRemoveTask(id){
  $('#task_'+id).remove();
}

function addNewBug(){
  if(/\S/.test($('#bug-input').val())){
    Bug.addBug(makeSafe($('#bug-input').val()));
    $('#bug-input').val('');
  }else{
    alert('Bug statement cannot be empty');
  }
}

function deleteBug(id){
  if(confirm("Are you sure you want to delete this bug:"+Bug.rawData.values[id][2])){
    Bug.removeBug(id);
  }
}

function displayAppendBug(group,statement,id){
  console.log(id);
  $('#'+group+'_table').append('<li id="bug_'+id+'" class="list-group-item ui-state-default bug_el btn btn-icon-split"> \
    <span class="text mr-auto">'+statement+'</span>      \
    <span class="icon float-right pt-auto pb-auto bg-danger text-light" onclick = deleteBug('+id+')> \
    <i class="fa fa-times"></i> \
    </span> \
  </li>');
}

function displayRemoveBug(id){
  $('#bug_'+id).remove();
}

function addNewIssue(){
  if(/\S/.test($('#issue-input').val())){
    Issue.addIssue(makeSafe($('#issue-input').val()));
    $('#issue-input').val('');
  }else{
    alert('Issue cannot be empty');
  }
}

function deleteIssue(id){
  if(confirm("Are you sure you want to delete this issue:"+Issue.rawData.values[id][2])){
    Issue.removeIssue(id);
  }
}

function displayAppendIssue(group,statement,id){
  console.log(id);
  $('#'+group+'_table').append('<li id="issue_'+id+'" class="list-group-item ui-state-default issue_el btn btn-icon-split"> \
    <span class="text mr-auto">'+statement+'</span>      \
    <span class="icon float-right pt-auto pb-auto bg-danger text-light" onclick = deleteIssue('+id+')> \
    <i class="fa fa-times"></i> \
    </span> \
  </li>');
}

function displayRemoveIssue(id){
  $('#issue_'+id).remove();
}


function addQuestion(){
  if(/\S/.test($('#question-input').val())){
    QnA.addQuestion(makeSafe($('#question-input').val()));
    $('#question-input').val('');
  }else{
    alert('Issue cannot be empty');
  }
}

function displayAppendQnA(q,ans,solved,id){
  if(solved == 'solved'){
    var qna_block =     '<li class="list-group-item qna_el p-0"><div class="card shadow qna_id_'+id+'"> \
    <a href="#qna_collapseCard_'+id+'" class="d-block card-header bg-success p-0" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="qna_collapseCard_'+id+'"> \
      <h6 class="m-0 font-weight-bold text-light"><button class="btn btn-primary" id = "qna_edit_'+id+'"  onclick="showQnAEditForm('+id+')" >edit</button><span class="pl-1">'+q+'</span></h6> \
    </a> \
    <!-- Card Content - Collapse --> \
    <div class="collapse" id="qna_collapseCard_'+id+'"> <div class="card-body"> <span class="pl-1" id="qna_answer_'+id+'">'+ans+'</span> \
    <div id="qna_edit_form_'+id+'"> \
    <input id = "qna_edit_question_'+id+'" value="'+q+'" > <br>\
    <textarea id="qna_edit_answer_'+id+'">'+ans+'</textarea><br> \
     <button class="btn btn-primary" onclick="QnAupdateChanges('+id+')">Save</button> \
     </div> </div> </div> </div></li>' ;
    $('#qna_list').append($(qna_block));

  }else{
    var qna_block =     '<li class="list-group-item qna_el p-0"><div class="card shadow qna_id_'+id+'"> \
    <a href="#qna_collapseCard_'+id+'" class="d-block card-header bg-danger p-0" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="qna_collapseCard_'+id+'"> \
      <h6 class="m-0 font-weight-bold text-light"><button class="btn btn-primary" id = "qna_edit_'+id+'" onclick="showQnAEditForm('+id+')" >edit</button><span class="pl-1">'+q+'</span></h6> \
    </a> \
    <!-- Card Content - Collapse --> \
    <div class="collapse" id="qna_collapseCard_'+id+'"> <div class="card-body"> <span class="pl-1" id="qna_answer_'+id+'">'+ans+'</span> \
    <div id="qna_edit_form_'+id+'"> \
    <input id = "qna_edit_question_'+id+'" value="'+q+'" > <br>\
    <textarea id="qna_edit_answer_'+id+'">'+ans+'</textarea><br> \
     <button class="btn btn-primary" onclick="QnAupdateChanges('+id+')">Save</button> \
     </div> </div> </div> </div></li>' ;
    $('#qna_list').append($(qna_block));
  }
  $('#qna_edit_form_'+id).hide();
}

function showQnAEditForm(id){
  $('#qna_edit_form_'+id).show();
}

function QnAupdateChanges(id){
  $('#qna_edit_form_'+id).hide();
  var q = makeSafe($('#qna_edit_question_'+id).val());
  var ans = makeSafe($('#qna_edit_answer_'+id).val());
  console.log(q);
  console.log(ans);
  console.log(id);
  QnA.updateQnA(q,ans,id);
}

function taskBars(type,value){
  value *=100;
  console.log(type,value);
  var bar_id,value_id;
  if(type == 'tasks'){
    value_id = '#completed_tasks_value';
    bar_id = '#completed_tasks_bar';
  }else if(type == 'bugs'){
    value_id= '#completed_bugs_value';
    bar_id = '#completed_bugs_bar';
  }else if(type == 'issues'){
    value_id = '#completed_issues_value';
    bar_id = '#completed_issues_bar';
  }else if(type == 'qnas'){
    value_id = '#completed_qnas_value';
    bar_id = '#completed_qnas_bar';
  }
  $(value_id).text(value.toString()+'%');
  $(bar_id).text(value.toString()+'%');
  $(bar_id).attr('style','width: '+value.toString()+'%');
  $(bar_id).attr('aria-valuenow',value.toString());
}

function appendDocument(name,id){
  var el_id = '#document_name_list';
  $(el_id).append('<button type="button" id="'+id+'" class="list-group-item list-group-item-action" onclick="displayFrame('+id+')">'+name+'</button>');
}

function displayFrame(id){
  // $('document_frame').attr('src',)
}

// class User{
//     constructor(){
//         this.userJSON = modelJSON('userName')
//         this.projects = [];
//         this.loadProjects();
//     }

//     loadProjects() {
//         for(var project in this.userJSON.projects){
//             var proj = new Project(this);
//             this.projects.push(proj,this.userJSON.projects[project].name);
//             proj.loadJson(this.userJSON.projects[project]);
//         }
//     }
// }

// class Project{
//     constructor(parent,name){
//         this.parent = parent
//         this.menuID = "tager_project_menu";
//         this.name = name;
//         this.title_id = "project_title_"+projectJSON["ID"]; 
//         var ele = $('<a class="dropdown-item" href="#"></a>');
//         ele.text(this.name);
//         ele.attr('id', this.title_id);
//         console.log(this.title_id);
//         console.log(ele);
//         appendDOM(this.menuID,ele);

//         this.tag_id = "project_title";
//     }

//     loadJson(projectJSON){
//         this.json = projectJSON;
//         this.menuID = "tager_project_menu";
//         this.name = projectJSON["name"];
//         this.title_id = "project_title_"+projectJSON["ID"]; 
//         this.tasks = [];
//         this.bugs = [];
//         this.issues = [];
//         this.questions = [];
//         this.loadTasks();
//         this.loadBugs();
//         this.loadIssues();
//         this.loadQnas();
//     }

//     view(){
//         for(var item of this.tasks){
//             item.view();
//         }
//         for(var item of this.bugs){
//             item.view();
//         }
//         for(var item of this.issues){
//             item.view();
//         }
//     }


//     loadTasks(projectJSON){
//         for(var task_el in this.json.tasks){
//             var tsk = new Task(this.json.tasks[task_el],this);
//             this.tasks.push(tsk);
//         }
//     }

//     loadBugs(projectJSON){
//         for(var bug_el in this.json.bugs){
//             var bg = new Bug(this.json.bugs[bug_el],this);
//             this.bugs.push(bg);
//             bg.view();
//         }
//     }

//     loadIssues(projectJSON){
//         for(var issue_el in this.json.issues){
//             var isu = new Issue(this.json.issues[issue_el],this);
//             this.issues.push(isu);
//             isu.view();
//         }
//     }

//     loadQnas(projectJSON){
//         for(var q_el in this.json.questions){
//             var qs = new QnA(this.json.questions[q_el],this);
//             this.questions.push(qs);
//             qs.view();
//         }
//     }

// }

// class Note{
//     constructor(html_id,parentID,date,statement,status){
//         this.date_val = date;
//         this.statement_val = statement;
//         this.status_val = status;
//         this.note_id = html_id;
//         this.parentID = parentID;
//     }

//     view(){
//         this.row = $('<tr class="" ></tr>');
//         this.date =   $('<td class="" id="'+this.note_id+'_date"></td>');
//         this.statement =   $('<td class="" id="'+this.note_id+'_statement"></td>');
//         this.status = $('<td class="" id="'+this.note_id+'_status"></td>');

//         this.date.text(this.date_val);
//         this.statement.text(this.statement_val);
//         this.status.text(this.status_val);

//         this.row.attr('id', this.note_id);
//         this.row.append(this.date);
//         this.row.append(this.statement);
//         this.row.append(this.status);
//         appendDOM(this.parentID,this.row);
//     }
// }

// class QnA{
//     constructor(jsonData,parent){
//         this.data = jsonData
//         this.id = 'qna_row_'+jsonData.ID;
//         this.question = jsonData.question;
//         this.answer = jsonData.answer;
//         this.parentID = "tager_qna_list";
//         this.color = this.answer.length === 0 ? 'primary' : 'success';
//         this.icon = this.answer.length === 0 ? 'clock ' : 'check';
//     }

//     view(){

//         this.card = $('<div class="card"></div>');
//         this.question_el = $('<a href="#qna_'+this.id+'" class="d-block card-header py-3" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="qna_'+this.id+'"><span class="text-'+this.color+'" id="'+this.id+'_question">'+this.question+' <i class="fa fa-'+this.icon+' ml-4"></i> </span> </a> ');
//         this.answer_el = $('<div class="collapse" id="qna_'+this.id+'"> <div class="card-body" id="'+this.id+'_answer"> '+this.answer+' </div></div> ');

//         this.card.attr('id', this.id);
//         this.card.append(this.question_el);
//         this.card.append(this.answer_el);
//         appendDOM(this.parentID,this.card);
//     }

// }

// class Documentation{

// }

// class Task extends Note{
//     constructor(jsonData,parent){
//         super("task_row_"+toString(jsonData.ID),"tager_task_list",jsonData.date,jsonData.statement,jsonData.status);
//         this.parent = parent
//         this.json = jsonData;
//         console.log(this.note_id);
//     }

// }

// class Bug extends Note{
//     constructor(jsonData,parent){
//         super("bug_row_"+toString(jsonData.ID),"tager_bug_list",jsonData.date,jsonData.statement,jsonData.status);
//         this.parent = parent
//         this.json = jsonData;
//     }    
// }

// class Issue extends Note{
//     constructor(jsonData,parent){
//         super("issue_row_"+toString(jsonData.ID),"tager_issue_list",jsonData.date,jsonData.statement,jsonData.status);
//         this.parent = parent
//         this.json = jsonData;
//     }    
// }

// user = new User();