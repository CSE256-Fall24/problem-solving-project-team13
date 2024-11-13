// ---- Define your dialogs  and panels here ----
const id_prefix = "effectivepermissions";
const addInfoCol = true; // Adjust as needed based on your requirements
const whichPermissions = null; // Use all permissions
const permissions_panal = define_new_effective_permissions(id_prefix, addInfoCol, whichPermissions);
let permsTitle = $(`
<div id="d"> 
    <h1>Effective Permissions</h1>
    <h3>   Click "select user" to see what permissions each user has.</h3>
</div>
`)
$('#sidepanel').append(permsTitle);
$('#sidepanel').append(permissions_panal)
const select_button_text = "select user";

const user_select_field = define_new_user_select_field(id_prefix, select_button_text, on_user_change = function(selected_user){$('#effectivepermissions').attr('username', selected_user)});
$('#sidepanel').append(user_select_field)


const title = 'more info';
const info = define_new_dialog(id_prefix, title, options);

$('.perm_info').click(function() {
    console.log('clicked!')
    info.dialog('open');
    const filepath = $('#effectivepermissions').attr('filepath')
    const username = $('#effectivepermissions').attr('username')
    const permissionType = $(this).attr('permission_name')

    console.log('Username:', username);
    console.log('Filepath:', filepath);
    console.log('Permission Type:', permissionType);
    //const permissionToCheck = $( this );
    const explain_why = true;
    const file = path_to_file[filepath];
    const user = all_users[username];
    const explanation = allow_user_action(file, user, permissionType, true)
    //const allow_user = allow_user_action(file, user, permissionToCheck, explain_why);
    //console.log($('#effectivepermissions').append(allow_user))
    const explanationText = get_explanation_text(explanation);
    //console.log(explanationText);
    // console.log($('#perm_info').text(explanationText));
    info.html(explanationText);

    // if (user && file) {
    //     //  const allowed = allow_user_action(file, user, perms);
    //     //  const explanation = get_explanation_text(allowed);
    //     const explanation = allow_user_action(file, user, permissionType, true)
    //     const explanationText = get_explanation_text(explanation);
    //      info.html(explanationText);
    //  //explanation.text(explanation);
    //      //explanation_dialog.dialog('open');
    //  } else {
    //      console.log("Error :(")
    //  }
    //info.html(explanationText);
})
// ---- Display file structure ----
$('#effectivepermissions').attr('filepath', '/C')

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="bi bi-folder2" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="bi bi-unlock" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="bi bi-file-earmark" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="bi bi-unlock" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});

// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId()