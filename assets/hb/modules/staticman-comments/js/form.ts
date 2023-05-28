import Snackbar from 'mods/snackbar/js/index.ts'
import Modal from 'js/bootstrap/src/modal'
import Client from './client'
import { Data } from './types'

class Form {
  private readonly btnSubmit: HTMLButtonElement
  private readonly spinner: HTMLElement

  private locked = false

  private readonly duration = 5000

  constructor (private readonly form: HTMLFormElement) {
    this.btnSubmit = form.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement
    this.spinner = this.btnSubmit.querySelector(
      '.spinner-border'
    ) as HTMLElement
  }

  init (): void {
    this.form.addEventListener('submit', (e) => {
      this.submit(e)
    })
    this.fillUp()
  }

  fillUp (): void {
    for (const item of ['name', 'email', 'url']) {
      const v = localStorage.getItem(`staticman-comments-${item}`)
      if (v !== null) {
        const input = this.form.querySelector(
          `input[name="fields[${item}]"]`
        ) as HTMLInputElement
        input.value = v
      }
    }
  }

  saveInfo (): void {
    const data = this.data()
    for (const field of ['name', 'email', 'url']) {
      localStorage.setItem(`staticman-comments-${field}`, data.fields[field])
    }
  }

  submit (e: SubmitEvent): void {
    e.preventDefault()
    if (!this.form.checkValidity()) {
      e.stopPropagation()
      return
    }

    if (this.locked) {
      return
    }

    this.lock()

    const client = new Client(this.form.action)

    client
      .send(this.data())
      .then((resp) => {
        if (!resp.success) {
          Snackbar.add(resp.message, this.duration)
          return
        }

        Snackbar.add(this.message(), this.duration)
        if (this.isReply()) {
          this.hideModal()
        }

        this.saveInfo()
      })
      .catch((err) => {
        Snackbar.add(err)
      })
      .finally(() => {
        this.unlock()
        this.reset()
      })
  }

  private message (): string {
    const el = this.form.querySelector('.comment-success-message') as HTMLElement
    return el.innerText ?? 'Success'
  }

  isReply (): boolean {
    return this.form.classList.contains('staticman-comment-reply-form')
  }

  hideModal (): void {
    const modal = this.form.closest('.modal')
    const obj = Modal.getInstance(modal)
    obj.hide()
  }

  data (): Data {
    const formData = new FormData(this.form)
    const data: Data = {
      fields: {},
      options: {}
    }
    for (const field of ['email', 'message', 'name', 'reply_to', 'root_id', 'url']) {
      const v = formData.get(`fields[${field}]`)
      if (v !== null && !(v instanceof File)) {
        data.fields[field] = v.toString()
      }
    }
    for (const option of ['slug']) {
      const v = formData.get(`options[${option}]`)
      if (v !== null && !(v instanceof File)) {
        data.options[option] = v.toString()
      }
    }
    if (formData.has('g-recaptcha-response')) {
      data['g-recaptcha-response'] = formData.get('g-recaptcha-response')?.toString() ?? ''
      data.options.reCaptcha = {
        siteKey: formData.get('options[reCaptcha][siteKey]')?.toString() ?? '',
        secret: formData.get('options[reCaptcha][secret]')?.toString() ?? ''
      }
    }
    return data
  }

  lock (): void {
    this.locked = true
    this.spinner.classList.remove('d-none')
    this.btnSubmit.setAttribute('disabled', 'true')
  }

  unlock (): void {
    this.locked = false
    this.spinner.classList.add('d-none')
    this.btnSubmit.removeAttribute('disabled')
  }

  reset (): void {
    this.form.reset()
    this.form.classList.remove('was-validated')
    const reCaptcha = this.form.querySelector<HTMLTextAreaElement>(
      'textarea[name="g-recaptcha-response"]'
    )
    reCaptcha?.dispatchEvent(new CustomEvent('reset'))
    this.fillUp()
  }
}

export default Form
