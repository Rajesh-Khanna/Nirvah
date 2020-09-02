class Model{
    static folderName2Id = {'root': 'root'};
    static folder_files = {};
    static startFolder = 'nirvah';
    static baseId = '';
    static usingParent = 'root';

    constructor(parent = 'root',callback_ = -1 ){
        console.log('Model firstline');
        this.getFilesFromFolder(parent,callback_);
        console.log('model last line inside');
    }

    getFilesFromFolder(parent_name = 'root',callback_){
        console.log('getFilesFromFolder');
        Model.usingParent = parent_name;
        console.log(parent_name);
        var urlId = $.urlParam('userId');
        if(urlId != ''){
            Model.folder_files['root'] = 'nirvah',
            Model.baseId = urlId;
            Model.folder_files[parent_name] = {
                'folderIds' : [urlId],
                'folderNames' : ['nirvah'],
                'fileIds' : [],
                'fileNames' : [],
            }
        }
        // initializing folder structure
        if(!(parent_name in Model.folder_files)){
            console.log('im here');
            Model.folder_files[parent_name] = {
                'folderIds' : [],
                'folderNames' : [],
                'fileIds' : [],
                'fileNames' : [],
            }
        }else{
            console.log('im here too');
            if(Model.baseId == '')
                Model.getTrackerId(Model.folder_files[parent_name],callback_);
            else
                callback_(Model.folder_files[parent_name]);
            return;
        }
        var parent_id = Model.folderName2Id[parent_name];
        
        console.log(parent_id);

        var param = {
            q: "'"+parent_id+"' in parents",
            orderBy: 'modifiedByMeTime',
            // field: "id, name, mimeType"
        };
        console.log(param);

        // Take care as it only returns max 100 files from folder
        gapi.client.drive.files.list(param).then(function(resp){
            console.log((resp));
            var listFiles = resp.result.files;
            for(var f in listFiles){
                if(listFiles[f].mimeType == 'application/vnd.google-apps.folder'){
                    Model.folder_files[Model.usingParent]['folderIds'].push(listFiles[f].id);
                    Model.folder_files[Model.usingParent]['folderNames'].push(listFiles[f].name);
                    Model.folderName2Id[listFiles[f].name] = listFiles[f].id;
                }else{
                    Model.folder_files[Model.usingParent]['fileIds'].push(listFiles[f].id);
                    Model.folder_files[Model.usingParent]['fileNames'].push(listFiles[f].name);
                }
            }

            if(Model.baseId == '')
                Model.getTrackerId(Model.folder_files[Model.usingParent],callback_);
            else
                callback_(Model.folder_files[Model.usingParent]);
        });
    }

    static getTrackerId(folder,callback_) {
        if(!folder['folderNames'].includes(Model.startFolder) && (Model.usingParent == 'root')){
            var result = User.createBaseFolder(folder,callback_)
        }else{
            Model.baseId = folder['folderIds'][folder['folderNames'].indexOf(Model.startFolder)];
            callback_(folder);
            console.log(Model.baseId);
        }
    }

    static createBaseFolder(folder,callback_){
        console.log('create Base Folder');
        var fileMetadata = {
            'name': Model.startFolder,
            'mimeType': 'application/vnd.google-apps.folder'
        };
        console.log(fileMetadata );
        gapi.client.drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        }).then((file)=>{
                // if (err) {
                //     // Handle error
                //     console.log('error 55');
                //     console.error(err);
                // } else {
                    console.log(file.result);
                    console.log('created 55');
                    Model.folderName2Id[Model.startFolder] = file.result.id;
                    Model.baseId = file.result.id;
                    console.log('Folder Id: ', file.result.id);
                    console.log('created Base Folder');
                    callback_(folder);
                // }
            }
        );
        console.log('goingout');
    }

    getForm(){

    }
}

class User extends Model{
    static projectObj = '';
    constructor(){
        super('root',()=>{
            this.loadProject();
        });
        console.log('User last line inside');
    }
    
    loadProject(){
        User.projectObj = new Project();
    }
}

class Project extends Model{
    static projectList = {};
    static projectNames = [];
    static currentProjectInfo = {
        'name': 'Not defined',
        'code': null,
        'demo': null,
        'download': null,
        'description': null,
        'id': null,
    }

    static tasks = '';
    static bugs = '';
    static issues = '';
    static qna = '';
    static documentation = '';

    constructor(){
        console.log('Project started');
        super(Model.startFolder,(val)=>{
            console.log('project super');
            console.log(val);
            console.log(this);
            this.getProjectsList(val);
        });
        console.log('Project started');
    }

    static appendProject(name,id){
        console.log('appedn');
        Project.projectList[name] = id
        Project.projectNames.push(name);
        // insert element into menu
        $('#tager_project_menu').append('<a class="dropdown-item pl-1 projectMenuItem" id="Project_'+name+'" onclick=openProjectPage("'+name+'")>' +name+ '</a>');
    }

    static removeProject(name){
        if(Project.projectList.hasOwnProperty(name)){
            delete Project.projectList[name];
        }
        Project.projectNames.splice(array.indexOf(name), 1);
        $('#tager_project_menu').remove();
    }

    // fills the static projectList wiht existing Projects lists
    getProjectsList(filesList){
        console.log('getProjectsList');
        for(var i =0;i< filesList.fileIds.length;i++){
            Project.appendProject(filesList.fileNames[i],filesList.fileIds[i])
        }

        console.log(Project.projectList);
        // Display project

        var projectNameUrl = $.urlParam('projectName');
        console.log(projectNameUrl);
        if( projectNameUrl != ''){
            console.log(Project.projectList);
            console.log(projectNameUrl);
            if(projectNameUrl in Project.projectList){
                Project.launchProject(projectNameUrl);
            } 
        }else if(Object.keys(Project.projectList).length == 0){
            // If no projects exist life project is created and added to the list
            Project.createProject();
        }else{
            // select the recently modified Project to display
            this.getLatest();
        }
    }

    static createProject(projectName = 'life'){
        console.log('createProject');
        if(projectName in Project.projectList){
            alert('This name already exist use a different name');
        }        

        // Create and movie a project to start folder
        gapi.client.sheets.spreadsheets.create({
            properties: {
                title: projectName
            },
            "sheets": [
                {
                    "properties": {
                    "title": "tasks"
                    }
                },
                {
                    "properties": {
                    "title": "bugs"
                    }
                },
                {
                    "properties": {
                    "title": "issues"
                    }
                },
                {
                    "properties": {
                    "title": "qnas"
                    }
                },
                {
                    "properties": {
                    "title": "documentations"
                    }
                },
                {
                    "properties": {
                    "title": "info"
                    }
                }
                ]   
        }).then((response) => {
            console.log('no error');
            console.log(response);
            var fileId = response.result.spreadsheetId; 
            gapi.client.drive.files.update({
                fileId: fileId,
                addParents: Model.baseId,
                removeParents: 'root',
                fields: 'id, name, parents'
            }).then(function(resp_file){
                console.log(resp_file);
                // launching the project to display
                console.log('projected created');
                Project.appendProject([resp_file.result.name], resp_file.result.id);
                console.log('entered open Project');
                openProjectPage(resp_file.result.name);
            });
        });
    }
 
    static launchProject(projectName){
        console.log('launchProject');
        Project.currentProjectInfo.name = projectName;
        Project.currentProjectInfo.id = Project.projectList[projectName];



        // changes the name of project and related stuff
        Project.loadInfo();
        // Handle Notes and subtasks
        // Pending
        Project.launchNotes();
    }

    static loadInfo(){
        var params = {
            spreadsheetId: Project.currentProjectInfo.id,
            range: "info!A1:A4"
          };
    
          var request = gapi.client.sheets.spreadsheets.values.get(params);
          request.then(function(response) {
              if(Object.keys(response.result).includes('values')){
                console.log(response);
                Project.currentProjectInfo.code = response.result.values[0][0];
                Project.currentProjectInfo.download = response.result.values[1][0];
                Project.currentProjectInfo.demo = response.result.values[2][0];
                Project.currentProjectInfo.description = response.result.values[3][0];
              }
            Project.DisplayProjectinfo();
          }, function(reason) {
            console.error('error: ' + reason.result.error.message);
          });
    }

    static DisplayProjectinfo(){
        console.log('display');
        var res = Project.currentProjectInfo;
        $('#project_title').text(res.name);
        $('#project_title2').text(res.name);
        if(res.code != null){
            $('#edit_project_code').val(res.code);
            $('#code_link').attr('href',res.code);
        }
        if(res.demo != null){
            $('#edit_project_demo').val(res.demo);
            $('#demo_link').attr('href',res.demo);
        }
        if(res.download != null){
            $('#edit_project_download').val(res.download);
            $('#download_link').attr('href',res.download);
        }
        if(res.description != null){
            $('#edit_project_description').val(res.description);
            $('#project_description').text(res.description);
        }
    }

    getLatest(){
        var latestProjectName = Project.projectNames[Project.projectNames.length-1];
        Project.launchProject(latestProjectName)
    }

    static launchNotes(){
        Project.tasks = new Task;
        Project.bugs = new Bug;
        Project.issues = new Issue;
        Project.qna = new QnA;
        // Project.documentation = new Documentation;
    }

    static updateProject(codeLink,downloadLink,demoLink,descriptionLink){
        gapi.client.sheets.spreadsheets.values.update({
            "spreadsheetId": Project.currentProjectInfo.id,
            "range": "info!A1:A4",
            "valueInputOption": "RAW",
            "resource": {
                "values": [
                    [codeLink],
                    [downloadLink],
                    [demoLink],
                    [descriptionLink]
                ]
            }
        }).then(function(response){
            console.log("Updated: ", response);
            $('#code_link').attr('href',codeLink);
            $('#demo_link').attr('href',demoLink);
            $('#download_link').attr('href',downloadLink);
            $('#project_description').text(descriptionLink);
            },function(err) { console.error("Execute error", err); 
        });
    }
}


class Note{
    constructor(subclass){
        this.loadDataType(subclass);
    }

    loadDataType(subclass){
        
        var params = {
            spreadsheetId: Project.currentProjectInfo.id,
            range: subclass.range
          };
    
          var request = gapi.client.sheets.spreadsheets.values.get(params);
          request.then(function(response) {
            subclass.loadData(response);
          }, function(reason) {
            console.error('error: ' + reason.result.error.message);
          });
    }

    static addNote(data,subclass){        
        var resource = {
            "values": [data]
        }
        var spreadsheetId = Project.currentProjectInfo.id;
        var range = subclass.range;
        console.log('applied');
        gapi.client.sheets.spreadsheets.values.append({
            "spreadsheetId":spreadsheetId,
            "range": range,
            "valueInputOption": "RAW",
            "resource": resource
        }).then(function(response) {
            console.log("Response", response);
          },
          function(err) { console.error("Execute error", err); });
        // resource, spreadsheetId, range));
    }

    static update(range,value){
        if(!Array.isArray(value)){
            value = [value];
        }
        console.log(value);
        console.log(range);
        gapi.client.sheets.spreadsheets.values.update({
            "spreadsheetId": Project.currentProjectInfo.id,
            "range": range,
            "valueInputOption": "RAW",
            "resource": {
              "values": [
                  value
              ]
            }
          }).then(function(response) 
          {
            console.log("Updated: ", response);
            },function(err) { console.error("Execute error", err); 
        });

    }
}

class QnA extends Note{
    static rawData;
    static range = 'qnas';

    constructor(){
        super(QnA)
    }

    static loadData(data){
        var res = data.result.values;
        QnA.rawData = data.result;
        if(!Object.keys(QnA.rawData).includes('values')){
            return;
        }
        var solved = [];
        var unsolved = []

        for(var i=0;i<res.length;i++){
            if(res[i][3] == 'removed')
                continue;
            if(res[i][2] == 'unsolved'){
                unsolved.push([res[i][0],res[i][1],res[i][2],i]);
            }else{
                solved.push([res[i][0],res[i][1],res[i][2],i]);
            }
        }


        for(var i=0;i<unsolved.length;i++)
            displayAppendQnA(unsolved[i][0],unsolved[i][1],unsolved[i][2],unsolved[i][3])
        for(var i=0;i<solved.length;i++)
            displayAppendQnA(solved[i][0],solved[i][1],solved[i][2],solved[i][3])

        taskBars('qnas',solved.length/(unsolved.length+solved.length));

    }

    static addQuestion(question){
        var id = '0';
        if(Object.keys(QnA.rawData).includes('values')){
            id = (QnA.rawData.values.length).toString();
        }
        Note.addNote([question,' ','unsolved','active'],QnA);
        displayAppendQnA(question,' ','unsolved',id);
    }

    static removeQnA(id){
        Note.update(QnA.range+'!D'+(parseInt(id)+1).toString(),'removed');
        displayRemoveQnA(id);
    }

    static updateQnA(question,answer,id){
        id = parseInt(id);
        var status = 'unsolved';
        if(/\S/.test(answer)){
            status = 'solved'
        }
        Note.update(QnA.range+'!A'+(id+1).toString()+':C'+(id+1).toString(),[question,answer,status]);
    }

}

// class Documentation{
//     static current_documentation_id;
//     static documents = [];
//     constructor(){
//         this.getFolder_files()
//     }

//     getFolder_files(){
//         var name = Project.currentProjectInfo.name;
//         var folder_name = name+'_documentation';
//         // check if folder exists this is filled when loading base folder
//         if(!Model.folderName2Id.includes(folder_name)){
//             this.createFolder(folder_name);
//         }else{
//             // first time creating folder
//             Documentation.current_documentation_id = Model.folderName2Id[folder_name];
//             this.launchDocumentation();
//         }
//     }

//     createFolder(folder_name){
//         var fileMetadata = {
//             'name': folder_name,
//             'mimeType': 'application/vnd.google-apps.folder'
//         };
//         console.log(fileMetadata );
//         gapi.client.drive.files.create({
//             resource: fileMetadata,
//             fields: 'id'
//         }).then((file)=>{
//             var fileId = file.result.id;
//             gapi.client.drive.files.update({
//                 fileId: fileId,
//                 addParents: Model.baseId,
//                 removeParents: 'root',
//                 fields: 'id, name, parents'
//             }).then(function(resp_file){
//                 console.log(resp_file);
//                 Model.folder_files[Model.startFolder]['folderIds'].push(resp_file.result.id);
//                 Model.folder_files[Model.usingParent]['folderNames'].push(resp_file.result.name);
//                 Model.folderName2Id[resp_file.result.name] = resp_file.result.id;
//                 // launching the project to display
//                 console.log('projected documentation folder');
//                 Documentation.current_documentation_id = resp_file.result.id;
//                 this.launchDocumentation();
//             });
//         });
//     }

//     launchDocumentation(){
//         // loading documentations
//         var param = {
//             q: "'"+Project.currentProjectInfo.id+"' in parents",
//             orderBy: 'modifiedByMeTime',
//             field: "id, name, mimeType"
//         };
//         console.log(param);

//         // Take care as it only returns max 100 files from folder
//         gapi.client.drive.files.list(param).then(function(resp){
//             console.log((resp));
//             var listFiles = resp.result.files;
//             for(var f in listFiles){
//                 Documentation.documents.push(listFiles[f].id);
//                 Documentation.documents.push(listFiles[f].name);
//                 appendDocument(listFiles[f].id,listFiles[f].name)
//             }
//         });
//     }

// }

var op = '';
class Task extends Note{
    /*
    id,
    order,
    status,
    statement
    */

    static data = {
        'todo': {},
        'progress': {},
        'completed': {},
    };
    static range = 'tasks';
    static nextOrder = 0;
    static rawData = [];


    constructor(){
        console.log('entered task');
        super(Task,Task.loadData);
    }

    static loadData(data){
        // change this to length
        Task.nextOrder = 0;
        var res = data.result.values;
        Task.rawData = data.result;
        var todolist = [],progress = [],completed = [];
        if(!Object.keys(Task.rawData).includes('values')){
            return;
        }

        for(var i=0;i<res.length;i++){
            if(res[i][3] == 'removed'){
                continue;
            }
            Task.data[res[i][1]][i] = {"statement": res[i][2],"id": res[i][0]};
            if(res[i][1] == 'todo'){
                todolist.push([res[i][0],i]);
            }else if(res[i][1] == 'progress'){
                progress.push([res[i][0],i]);
            }else if(res[i][1] == 'completed'){
                completed.push([res[i][0],i]);
            }
        }
        todolist.sort(function(a, b){return -parseInt(a[0]) + parseInt(b[0])});
        progress.sort(function(a, b){return -parseInt(a[0]) + parseInt(b[0])});
        completed.sort(function(a, b){return -parseInt(a[0]) + parseInt(b[0])});

        for(var i=0;i<todolist.length;i++){
            displayAppendTask('todo',Task.data['todo'][todolist[i][1]].statement,todolist[i][1]);
        }
        for(var i=0;i<progress.length;i++){
            displayAppendTask('progress',Task.data['progress'][progress[i][1]].statement,progress[i][1]);
        }
        for(var i=0;i<completed.length;i++){
            displayAppendTask('completed',Task.data['completed'][completed[i][1]].statement,completed[i][1]);
        }
        taskBars('tasks',completed.length/(completed.length+progress.length+todolist.length));
    }

    static addTask(statement){ 
        var id = 0;
        if(Object.keys(Task.rawData).includes('values')){
            id = Task.rawData.values.length;
        }

        Note.addNote([id,'todo',statement],Task);
        displayAppendTask('todo',statement,id);
    }

    static removeTask(id){
        Note.update(Task.range+'!D'+(parseInt(id)+1).toString(),'removed');
        displayRemoveTask(id);
    }

    static changeStatus(source,target,id){
        id = parseInt(id);
        Task.data[target][id] = Task.data[source][id];
        delete Task.data[source][id];
        Note.update(Task.range+'!B'+(id+1).toString(),target);
    }
}

class Bug extends Note{
    static data = {
        'current': {},
        'resolved': {},
    };
    static range = 'bugs';
    static nextOrder = 0;
    static rawData = [];

    constructor(){
        console.log('entered bug');
        super(Bug,Bug.loadData);
    }

    static loadData(data){
        // change this to length
        Bug.nextOrder = 0;
        var res = data.result.values;
        Bug.rawData = data.result;
        var current = [],resolved = [];
        if(!Object.keys(Bug.rawData).includes('values')){
            return;
        }
        for(var i=0;i<res.length;i++){
            if(res[i][3] == 'removed'){
                continue;
            }
            Bug.data[res[i][1]][i] = {"statement": res[i][2],"id": res[i][0]};
            if(res[i][1] == 'current'){
                current.push([res[i][0],i]);
            }else if(res[i][1] == 'resolved'){
                resolved.push([res[i][0],i]);
            }
        }
        current.sort(function(a, b){return -parseInt(a[0]) + parseInt(b[0])});
        resolved.sort(function(a, b){return -parseInt(a[0]) + parseInt(b[0])});
        
        for(var i=0;i<current.length;i++){
            displayAppendBug('current',Bug.data['current'][current[i][1]].statement,current[i][1]);
        }
        for(var i=0;i<resolved.length;i++){
            displayAppendBug('resolved',Bug.data['resolved'][resolved[i][1]].statement,resolved[i][1]);
        }
        
        taskBars('bugs',resolved.length/(current.length+resolved.length));
    }

    static addBug(statement){ 
        var id = 0;
        if(Object.keys(Bug.rawData).includes('values')){
            id = Bug.rawData.values.length;
        }
        Note.addNote([id,'current',statement],Bug);
        displayAppendBug('current',statement,id);
    }

    static removeBug(id){
        Note.update(Bug.range+'!D'+(parseInt(id)+1).toString(),'removed');
        displayRemoveBug(id);
    }

    static changeStatus(source,target,id){
        id = parseInt(id);
        Bug.data[target][id] =  Bug.data[source][id];
        delete Bug.data[source][id];
        Note.update(Bug.range+'!B'+(id+1).toString(),target);
    }

}

class Issue extends Note{
    static data = {
        'current': {},
        'resolved': {},
    };
    static range = 'issues';
    static nextOrder = 0;
    static rawData = [];

    constructor(){
        console.log('entered issue');
        super(Issue,Issue.loadData);
    }

    static loadData(data){
        // change this to length
        Issue.nextOrder = 0;
        var res = data.result.values;
        Issue.rawData = data.result;
        var current = [],resolved = [];
        if(!Object.keys(Issue.rawData).includes('values')){
            return;
        }
        for(var i=0;i<res.length;i++){
            if(res[i][3] == 'removed'){
                continue;
            }
            Issue.data[res[i][1]][i] = {"statement": res[i][2],"id": res[i][0]};
            if(res[i][1] == 'current'){
                current.push([res[i][0],i]);
            }else if(res[i][1] == 'resolved'){
                resolved.push([res[i][0],i]);
            }
        }
        current.sort(function(a, b){return -parseInt(a[0]) + parseInt(b[0])});
        resolved.sort(function(a, b){return -parseInt(a[0]) + parseInt(b[0])});
        
        for(var i=0;i<current.length;i++){
            displayAppendIssue('current_issue',Issue.data['current'][current[i][1]].statement,current[i][1]);
        }
        for(var i=0;i<resolved.length;i++){
            displayAppendIssue('resolved_issue',Issue.data['resolved'][resolved[i][1]].statement,resolved[i][1]);
        }
        taskBars('issues',resolved.length/(current.length+resolved.length));
        
    }

    static addIssue(statement){ 
        var id = 0;
        if(Object.keys(Issue.rawData).includes('values')){
            id = Issue.rawData.values.length;
        }

        Note.addNote([id,'current',statement],Issue);
        displayAppendIssue('current_issue',statement,id);
    }

    static removeIssue(id){
        Note.update(Issue.range+'!D'+(parseInt(id)+1).toString(),'removed');
        displayRemoveIssue(id);
    }

    static changeStatus(source,target,id){
        id = parseInt(id);
        Issue.data[target][id] =  Issue.data[source][id];
        delete Issue.data[source][id];
        Note.update(Issue.range+'!B'+(id+1).toString(),target);
    }
}

// user = new User();


