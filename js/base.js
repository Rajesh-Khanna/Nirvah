console.log('base.js');

$(function () { $('.popover-toggle').popover('toggle');});

displaySlide = 'main-slide';
function navigateSlide(id){
  $('#'+displaySlide).addClass('slide-c');
  displaySlide = id;
  $('#'+id).removeClass("slide-c");
}

$(document).ready(function() {
  console.log('load start');

  $('#task-slide').load('tasks.html',sortable_task_init);
  $('#issue-slide').load('issues.html',sortable_issue_init);
  $('#bug-slide').load('bugs.html',sortable_bug_init);
  $('#QnA-slide').load('qnas.html',qnas_init);
  console.log('loaded');
});

$.urlParam = function(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if(results == null){
      return '';
  }
  return results[1] || 0;
}

function  sortable_bug_init(){
  console.log('sortable started');
  console.log($( "#current_table").html());
  $( "#current_table, #resolved_table" ).sortable({
    connectWith: "ul.connectedSortable_bugs",
    stop: function( event, ui ) {
        var source = event.target.id.split('_')[0];
        var id = ui.item[0].id.split('_')[1];
        var target = ui.item.parent()[0].id.split('_')[0];
        Bug.changeStatus(source,target,id);
    }
  }).disableSelection();
}

function  sortable_issue_init(){
  console.log('sortable started');
  console.log($( "#current_issue_table").html());
  $( "#current_issue_table, #resolved_issue_table" ).sortable({
    connectWith: "ul.connectedSortable_issues",
    stop: function( event, ui ) {
        var source = event.target.id.split('_')[0];
        var id = ui.item[0].id.split('_')[1];
        var target = ui.item.parent()[0].id.split('_')[0];
        Issue.changeStatus(source,target,id);
    }
  }).disableSelection();
}


function  sortable_task_init(){
  console.log('sortable started');
  console.log($( "#todo_table").html());
  $( "#todo_table, #progress_table, #completed_table" ).sortable({
    connectWith: "ul.connectedSortable_tasks",
    stop: function( event, ui ) {
        var source = event.target.id.split('_')[0];
        var id = ui.item[0].id.split('_')[1];
        var target = ui.item.parent()[0].id.split('_')[0];
        Task.changeStatus(source,target,id);
    }
  }).disableSelection();
}
function qnas_init(){
  $("#qna_filter").on("keyup", function() {
    var value = this.value.toLowerCase().trim();
    $("#qna_list .qna_el").show().filter(function() {
      return $(this).text().toLowerCase().trim().indexOf(value) == -1;
    }).hide();
  });  
}