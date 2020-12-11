const sendButtonID = document.getElementById('sendButtonID')
const sendButtonGUILDID = document.getElementById('sendButtonGUILDID')
const sendButtonGUILDNAME = document.getElementById('sendButtonGUILDNAME')


sendButtonID.onclick = () => {
    var userId = document.getElementById('commandInputID').value

    location.href = `/admin/user/${userId}`
}

sendButtonGUILDID.onclick = () => {
    var userId = document.getElementById('commandInputID').value
    const guildId = document.getElementById('commandInputGUILDID').value

    location.href = `/admin/user/${userId}/guild_id/${guildId}`
}

sendButtonGUILDNAME.onclick = () => {
    var userId = document.getElementById('commandInputID').value
    const guildName = document.getElementById('commandInputGUILDNAME').value

    location.href = `/admin/user/${userId}/guild_name/${guildName}`
}