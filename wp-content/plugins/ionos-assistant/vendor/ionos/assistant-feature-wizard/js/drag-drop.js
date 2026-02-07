var fileobj;

function upload_file(e) {
	e.preventDefault();
	fileobj = e.dataTransfer.files[0];
	ajax_file_upload(fileobj);
}

function file_explorer() {
	document.getElementById('blueprint_file').click();
	document.getElementById('blueprint_file').onchange = function() {
		fileobj = document.getElementById('blueprint_file').files[0];
		ajax_file_upload(fileobj);
	};
}

function ajax_file_upload(file_obj) {
	if(file_obj != undefined) {
		var form_data = new FormData();
		form_data.append('file', file_obj);
		var xhttp = new XMLHttpRequest();
		var url = document.URL;
		url = url.split("admin.php");
		blueprint_upload_url = url[0]+"admin-post.php?action=ionos_assistant_blueprint_upload";
		xhttp.open("POST", blueprint_upload_url, false);

		xhttp.onreadystatechange = function() {//Call a function when the state changes.
			if(xhttp.readyState == 4 && xhttp.status == 200) {
			}
		}

		xhttp.send(form_data);
		xhttp.addEventListener("load", transferComplete(url[0]));
		xhttp.addEventListener("error", transferFailed);
	}
}

function transferComplete(url) {
	location.href = url+"admin.php?page=ionos-assistant&step=summary";
}

function transferFailed(evt) {
	// TODO better error handling
	alert("An error occurred while transferring the file. Please, refresh page!");
}

function back_btn() {
	var url = document.URL;
	url = url.split("admin.php");

	location.href = url[0] + "admin.php?page=ionos-assistant";
}