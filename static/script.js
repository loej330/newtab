//KEYMAPPINGS
const next_context = '['
const prev_context = ']'
const next_selection = 'n'
const prev_selection = 'p'

const modes = Object.freeze({
    ENGINE: { name: "Engine" },
    BOOKMARKS: { name: "Bookmarks" },
})

//document.querySelector('input[value="google"]').checked = true
const engines = new Map([
    ["google", "https://www.google.com/search?q="],
    ["duckduckgo", "https://duckduckgo.com/?q="],
    ["lucky", "https://duckduckgo.com/?q=\\"],
])
const div_input = document.getElementById('input')
const div_bookmarks = document.getElementById('bookmarks')
const div_bookmarks_list = document.getElementById('bookmarks-list')
const div_status = document.getElementById('status')

const api_url = 'http://localhost:5000'

var engine = "duckduckgo"
var mode = modes.BOOKMARKS
var selection = 0

async function get_bookmarks() {
    const url = api_url + '/bookmarks'
    const response = await fetch(url)
    const bookmarks = await response.json()
    var indexed_data = new Array(bookmarks.length)
    var searchable_data = new Array(bookmarks.length)
    for (const i in bookmarks) {
        indexed_data[i] = bookmarks[i]
        searchable_data[i] = [parseInt(i, 10), bookmarks[i][0].toLowerCase()]
    }
    return [indexed_data, searchable_data]
}

var update_fuzzy
var last_search = ""
var bookmark_search_memo = new Array(120)
var bookmark_search 
var bookmark_data

function display_selection() {
    div_bookmarks_list.children[selection].classList.add('selected')
}

function display_bookmarks() {
    div_bookmarks_list.replaceChildren()
    for (const [i, _] of bookmark_search) {
        const div = document.createElement('div');
        div.textContent = bookmark_data[i][0]
        div_bookmarks_list.appendChild(div) 
    }
    display_selection()
}

get_bookmarks().then(([indexed_data, searchable_data]) => {
    bookmark_data = indexed_data
    bookmark_search_memo[0] = searchable_data
    bookmark_search = bookmark_search_memo[0]
    display_bookmarks()
    update_fuzzy = function(search) {
        console.log(search)
        const l = search.length
        const ll = last_search.length
        if (l > ll) {
            bookmark_search_memo[l] = bookmark_search.filter(
                ([_, name]) => name.startsWith(search)
            )
            bookmark_search = bookmark_search_memo[l]
            display_bookmarks()
        } else if (l < ll) {
            bookmark_search_memo[ll] = []
            bookmark_search = bookmark_search_memo[l]
            display_bookmarks()
        } else { return }
        last_search = search
    }
})

// This implementation is very slow...
// Possible bottlenecks - js fetch, python server, selenium, duck duck go
async function lucky(query) {
    const url = api_url + '/lucky'
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(query)
    })
    const lucky_url = await response.text()
    return lucky_url
}

//Ideas:
//Autocompletion using AI, search history, boobmarks
//Search within site using search engine or site search

div_input.value = ""
//div_bookmarks.style.visibility = "hidden"
div_input.focus()

div_input.addEventListener('keydown', function(e) {
    switch (e.key) {
        case "[":
            e.preventDefault()
            if (mode === modes.ENGINE) {
                mode = modes.BOOKMARKS
                div_status.textContent = "SEARCH in your bookmarks"
                div_bookmarks.style.visibility = "visible"
            } else {
                mode = modes.ENGINE
                div_status.textContent = "SEARCH google"
                div_bookmarks.style.visibility = "hidden"
            }
            break;
        case "Enter":
            if (mode === modes.ENGINE) {
                const query = e.target.value
                const url = engines.get(engine) + query
                window.location.href = url
            } else if (mode === modes.BOOKMARKS) {
                window.location.href = bookmark_data[bookmark_search[selection][0]][1]
                //window.location.href = 
            }
            break;
    }
})

div_input.oninput = function() {
    update_fuzzy(div_input.value)
    if (mode === modes.ENGINE) {
    } else {
    }
}
