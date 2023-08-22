import vconsole from 'vconsole'
import './style.css'

const _XMLHttpRequest = XMLHttpRequest

interface Interceptor {
  intercept: boolean
  response: string
}

const interceptorsMap = new Map<string, Interceptor>()

let lock = false

const setMenu = (url: string, method: string, response: string) => {
  const panel = document.querySelector('.mxp') as HTMLDivElement
  const holder = document.createElement('div')
  holder.setAttribute('class', 'req-holder')
  holder.setAttribute(
    'id',
    `${method}-${url}`.replace(/\/|:|\./g, '-').toLowerCase()
  )

  const checkBox = document.createElement('input')
  checkBox.setAttribute('class', 'checkbox')
  checkBox.setAttribute('type', 'checkbox')

  if (response !== '') checkBox.checked = true

  const methodText = document.createElement('div')
  methodText.setAttribute('class', `method ${method.toLowerCase()}`)
  methodText.innerText = method

  const urlText = document.createElement('div')
  urlText.setAttribute('class', 'url')
  urlText.innerText = url

  const responseBox = document.createElement('textarea')
  responseBox.setAttribute('class', 'response')
  responseBox.setAttribute('spellcheck', 'false')
  responseBox.value = response

  checkBox.onchange = () => {
    if (checkBox.checked) {
      const interceptors: { [x: string]: string } = JSON.parse(
        localStorage.getItem('intercepts') || '{}'
      )
      interceptors[`${method}:*:${url}`] = responseBox.value
      localStorage.setItem('intercepts', JSON.stringify(interceptors))
      interceptorsMap.set(`${method}:*:${url}`, {
        intercept: true,
        response: responseBox.value,
      })
    } else {
      const interceptors: { [x: string]: string } = JSON.parse(
        localStorage.getItem('intercepts') || '{}'
      )
      delete interceptors[`${method}:*:${url}`]
      localStorage.setItem('intercepts', JSON.stringify(interceptors))
      interceptorsMap.set(`${method}:*:${url}`, {
        intercept: false,
        response: responseBox.value,
      })
    }
  }

  responseBox.onchange = () => {
    if (checkBox.checked) {
      const interceptors: { [x: string]: string } = JSON.parse(
        localStorage.getItem('intercepts') || '{}'
      )
      interceptors[`${method}:*:${url}`] = responseBox.value
      localStorage.setItem('intercepts', JSON.stringify(interceptors))
    }
  }

  responseBox.oninput = () => {
    responseBox.style.height = responseBox.scrollHeight + 'px'
  }

  responseBox.onblur = () => {
    const source = responseBox.value
    try {
      responseBox.value = JSON.stringify(JSON.parse(source), undefined, 2)
    } catch {
      responseBox.value = source
    }
  }

  responseBox.onfocus = () => {
    responseBox.style.height = responseBox.scrollHeight + 'px'
  }

  holder.appendChild(checkBox)
  holder.appendChild(methodText)
  holder.appendChild(urlText)
  holder.appendChild(responseBox)

  panel.appendChild(holder)
}

class MockedXHR {
  xhr: XMLHttpRequest
  method = ''
  url = ''

  response = ''
  responseText = ''
  status = 0
  statusText = ''
  responseHeaders = {}
  onloadend = () => {}

  constructor() {
    this.xhr = new _XMLHttpRequest()
  }

  open(
    method: string,
    url: string,
    async: boolean = false,
    user: string | undefined | null = null,
    password: string | undefined | null = null
  ) {
    this.method = method
    this.url = url

    if (!interceptorsMap.has(`${this.method}:*:${this.url}`)) {
      interceptorsMap.set(`${this.method}:*:${this.url}`, {
        intercept: false,
        response: '',
      })

      setMenu(this.url, this.method, '')
    }

    this.xhr.open(method, url, async, user, password)
    this.xhr.onloadend = () => {
      const responseBox = document
        .querySelector(
          `#${method}-${url}`.replace(/\/|:|\./g, '-').toLowerCase()
        )
        ?.querySelector('.response') as HTMLInputElement

      const source = this.xhr.response || this.xhr.responseText
      try {
        responseBox.value = JSON.stringify(JSON.parse(source), undefined, 2)
      } catch {
        responseBox.value = source
      }

      this.response = this.xhr.response
      this.responseText = this.xhr.responseText
      this.status = this.xhr.status
      this.statusText = this.xhr.statusText
      this.onloadend()
    }
  }

  abort() {
    this.xhr.abort()
  }

  send(body: any) {
    if (
      interceptorsMap.has(`${this.method}:*:${this.url}`) &&
      interceptorsMap.get(`${this.method}:*:${this.url}`)?.intercept
    ) {
      const response = interceptorsMap.get(
        `${this.method}:*:${this.url}`
      )?.response
      this.responseText = response as string
      this.response = response as string
      this.status = 200
      this.onloadend()
    } else {
      this.xhr.send(body)
    }
  }
}

export const createMockXHRPlugin = () => {
  ;(window as Window).XMLHttpRequest = MockedXHR

  const mockXHRPlugin = new vconsole.VConsolePlugin('mock_xhr', 'MOCK')

  mockXHRPlugin
    .on('renderTab', (cb) => {
      cb(`<div class='mxp'></div>`)

      if (!lock) {
        lock = true

        const interceptors: { [x: string]: string } = JSON.parse(
          localStorage.getItem('intercepts') || '{}'
        )

        Object.keys(interceptors).forEach((v) => {
          const req = v.split(':*:') as [string, string]
          setMenu(req[1], req[0], interceptors[v] as string)
          interceptorsMap.set(v, {
            intercept: true,
            response: interceptors[v] as string,
          })
        })
      }
    })
    .on('addTool', function (callback) {
      const button = {
        name: 'Reload',
        onClick: function () {
          location.reload()
        },
      }
      callback([button])
    })

  return mockXHRPlugin
}
