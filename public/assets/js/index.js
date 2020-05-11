//Util functions 
const createCKElement = (tagName, options = {}, children) => {
  const ele = document.createElement(tagName)
  if(options) {
    const optionEntries = Object.entries(options)
    if (optionEntries.length) {
      for (const [attribute, value] of optionEntries) {
        ele.setAttribute(attribute,value)
      }
    }
  }
  children && ele.appendChild(children)
  return ele
}

//Fetch Data API calls
const fetchRootLevelBooks = () => (fetch('/api/book/maths')
.then(response => response.json()))

const fetchInnerSection = (bookId) => (fetch(`/api/book/maths/section/${bookId}`)
.then(response =>  response.json()))


//Document composition inner chapters
const fetchInnerSectionDocument = (bookId, target, otherThis) => (fetchInnerSection(bookId)
  .then(data => {
    otherThis.isSectionInvoked = true
    if(data.status !== 'NOT-FOUND') {
      const innerSectionUl = createCKElement('ul', {class:'section-container'})
      const mathSection = data.response
      const totalCourses = mathSection[bookId].length
      let completed = 0
      let buttonText = ''
        if(totalCourses) {
          const progressBar = createCKElement('div', {class:'progressbar'}, createCKElement('div', {class:'innerbar', id:bookId}))
          progressBar.addEventListener('click', (event) => event.stopPropagation())
          innerSectionUl.appendChild(progressBar)
          mathSection[bookId].forEach(element => {
            // Creating the inner Panel for Chapter one List
            const innerSectionLi = createCKElement('li',{class:'section-list'})
            if (element.status === 'COMPLETE') {
              completed++
              buttonText = 'COMPLETED'
            } else buttonText = element.status.replace('_',' ')
            const classNameButton =  element.status.toLowerCase()
            innerSectionLi.innerHTML = `<span>${element.title}</span> <button class="${classNameButton}">${buttonText}</button>`;
            innerSectionLi.addEventListener('click', (event) => event.stopPropagation())
            innerSectionUl.appendChild(innerSectionLi)
          })
        }
      target.appendChild(innerSectionUl)
      const progressEl = document.getElementById(bookId)
      if(progressEl) progressEl.style.width = (Math.round((completed/totalCourses) * 100)+'%')
    }
    else {
      const noResultEl = createCKElement('h3',{class:'section-container'})
      noResultEl.innerText = `Results not found`;
      target.appendChild(noResultEl)
    }
    target.setAttribute('data-section', true)
  }))

//Document composition first layer chapters
const fetchFirstLayerDocument = (element, bookUl) => {
    const li = createCKElement('li',{class:'book-list','data-book-id': element.id, 'data-section': false})
    li.innerText = element.title;
    this.isSectionInvoked  = false
    li.addEventListener("click", function (event) {
      event.preventDefault()
      const { dataset:{ bookId = '' } } = event.target
      bookId && !this.isSectionInvoked ?
        fetchInnerSectionDocument(bookId, event.target, this) :
        li.setAttribute('data-section',li.dataset.section === 'true' ? false : true)
    });
    bookUl.appendChild(li)
}

//Init session
const initSession = () => (fetchRootLevelBooks()
  .then(data => {
      const rootElement = document.getElementById('root')
      if(data.status !== 'NOT-FOUND') {
        const bookUl = createCKElement('ul')
          const mathBooks = data.response
          if(mathBooks.length) {
            mathBooks.forEach(element => fetchFirstLayerDocument(element, bookUl));
        }
        rootElement.appendChild(bookUl)
      }
      else {
        const noResultEl = createCKElement('h3',{className:'alert'})
        noResultEl.innerText = 'Something Went Wrong';
        rootElement.appendChild(noResultEl)  
      }
  }
  ))
initSession()
