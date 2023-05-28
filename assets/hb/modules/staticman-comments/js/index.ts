import 'js/bootstrap/src/modal'
import Form from './form'

(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll<HTMLFormElement>('form.staticman-form')
    forms.forEach((el) => {
      const form = new Form(el)
      form.init()
    })

    const modal = document.getElementById('staticman-comment-reply-modal')
    modal?.addEventListener('show.bs.modal', (evt: Event) => {
      const button = evt.relatedTarget
      const form = modal.querySelector('form.staticman-comment-reply-form')
      const rootID = form?.querySelector('input[name="fields[root_id]"]') as HTMLInputElement
      rootID.value = button.getAttribute('data-root-id')
      const replyTo = form?.querySelector('input[name="fields[reply_to]"]') as HTMLInputElement
      replyTo.value = button.getAttribute('data-comment-id')
      const title = modal?.querySelector('#comment-reply-modal-to') as HTMLElement
      title.innerHTML = button.getAttribute('data-comment-name')
    })
  })
})()
