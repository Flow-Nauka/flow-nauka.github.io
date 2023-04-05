const inputElement = document.querySelector('input[type="file"]')
const previewElement = document.getElementById('result')
const extensionTypeElement = document.getElementById('drainext')
const downloadBtn = document.getElementById('datadrain')

const fileprops = { fname: '', ctype: '', ext: '' }
const records = []
const header = {
  id: '(Lp)',
  start: 'początek (min:sec.set)',
  end: 'koniec (min:sec.set)',
  text: 'wynik'
}

extensionTypeElement.addEventListener('change', extSelected)
downloadBtn.onclick = downloadFile

inputElement.addEventListener('change', (event) => {
  extensionTypeElement.selectedIndex = 0

  const file = event.target.files[0]
  const reader = new FileReader()

  reader.addEventListener('load', (event) => {
    if (!event.target || !event.target.result) return

    const fileContents = event.target.result
    extractTimedTextLines(fileContents)

    previewElement.innerText = createPreview()
  })

  reader.readAsText(file)
})

function extractTimedTextLines(rawData) {
  const series = JSON.parse(rawData)

  // const records = series.map(datapoint => ({id: datapoint.id,start: toTimestamp(datapoint.start),end: toTimestamp(datapoint.end),text: datapoint.text.replace(/^\s|"/, '')}))
  series.forEach(line => {
    records.push([
      line.id, toTimestamp(line.start), toTimestamp(line.end), line.text.replace(/^\s|"/, '')
    ])
  }
  )
}

function createPreview() {
  const parsed = Object.values(header).join("\t")

  return `${parsed}\n${records.slice(0, 40).map(r => r.join("\t")).join("\n")}`
}

function extSelected(event) {
  const origfname = inputElement.files[0].name.substring(0, inputElement.files[0].name.lastIndexOf('.'))

  fileprops.fname = origfname
  fileprops.ctype = { 'txt': 'text/plain', 'csv': 'text/csv' }[event.target.value]
  fileprops.ext = '.' + event.target.value

  if (["txt", "csv"].includes(event.target.value)) downloadBtn.removeAttribute('disabled')
  else downloadBtn.setAttribute('disabled', 'disabled')
}

function downloadFile() {
  const blob = new Blob([
    records.map(r => r.join(
      fileprops.ext == '.txt' && "\t" || fileprops.ext == '.csv' && "|" || ','
    )).join("\n")
  ], { type: fileprops.ctype }
  )
  // Create a new URL object with the URL of the Blob object
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = String(fileprops.fname + fileprops.ext)

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  // Revoke the URL object to free up memory
  URL.revokeObjectURL(url)
}

// HELPERS
function toTimestamp(secs) {
  if (secs < 10.00) {
    return `00:0${secs.toFixed(2)}`
  }
  if (secs < 60.00) {
    return `00:${secs.toFixed(2)}`
  }

  const m = Math.floor(secs / 60)
  const s = (secs % 60).toFixed(2)
  return `${m < 10 ? '0' : ''}${m}:${s < 10.00 ? '0' : ''}${s}`
}

window.onerror = function () {
  const errnote = document.getElementById('errnote')
  const err = arguments[4]
  errnote.classList.remove('hidden')
  errnote.querySelector('pre').innerText = String(err.message + "\n" + err.stack)
}


// const csvWriter = csv({
//   path: outputCsvFile,
//   header: [
//     {id: 'id', title: 'lp'},
//     {id: 'start', title: 'początek (min:sec.set)'},
//     {id: 'end', title: 'koniec (min:sec.set)'},
//     {id: 'text', title: 'wynik'}
//   ],
//   fieldDelimiter: '|'
// })
