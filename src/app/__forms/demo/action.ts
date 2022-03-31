/*
 * define here the form actions
 */

import {FormProperty} from "ngx-schema-form";

export const actions = {
  'action_1': (property) => {
    actions['onModelChangeFinal'].emit('action_1')
  },
  'action_2': (property) => {
    actions['onModelChangeFinal'].emit('action_2')
  },
  'action_upload_model': function (property: FormProperty, params: any | {
    upload: {
      /**
       * The message show in an alert dialog when the upload succeeds.<br/>
       * If empty no alert will be shown.<br/>
       */
      success: string
      /**
       * The message show in an alert dialog when the upload fails.<br/>
       * If empty no alert will be shown.<br/>
       */
      error: string
      /**
       * The path pointing to the property whose value will be set from the uploaded file.<br/>
       * Usually an path separated by <code>/</code><br/>
       * but <code>.</code> may be also used.
       */
      property: string
    }
  }) {
    const options = ((params || {}) as {
      upload: {
        success: string
        error: string
        property: string
      }
    }).upload
    const _error = options.error
    const _success = options.success
    const _path = (options.property || '').replace(new RegExp('[.]', 'gi'), '/')
    const _root = property.findRoot()
    const _target = (_path && _root.getProperty(_path)) || _root

    const upload = () => {
      const fileupload = document.createElement('input')
      fileupload.type = 'file'
      fileupload.style.display = 'none'
      fileupload.style.cssText = `opacity:0; height:0px;width:0px;`
      fileupload.accept = 'application/json'
      document.body.appendChild(fileupload)

      fileupload.onchange = (event) => {
        event.preventDefault()
        console.log('event:', event)
        const reader = new FileReader()

        reader.onerror = (error) => {
          if (_error) {
            alert(_error)
          }
          console.error('Upload failed: Reader error.', error)
        }
        const onReady = (filename, textContent) => {
          try {
            const val = JSON.parse(textContent)
            _target.setValue(val, false)
            if (_success) {
              alert(_success)
            }
          } catch (e) {
            if (_error) {
              alert(_error)
            }
            console.error('Upload failed: Incompatible file \'' + filename + '\'.', e, 'Content:', textContent)
          }
        }

        reader.onloadend = function (evt) {
          if (evt.target['readyState'] === FileReader.DONE) {
            onReady(fileupload.files[0].name, evt.target['result'])
          }
        }
        reader.readAsText(fileupload.files[0], fileupload.files[0].name)
        document.body.removeChild(fileupload)
      }
      fileupload.click()
    }
    upload()
  },
  'action_download_model': function (property: FormProperty, params: any |
    {
      download: {
        /**
         * Open a dialog that lets change the download file name.<br/>
         * If empty the download begins immediately.<br/>
         */
        prompt: string
        /**
         * The download file name.<br/>
         */
        name: string
        /**
         * The path pointing to the property that will be converted to JSON to being downloaded.<br/>
         * Usually an path separated by <code>/</code><br/>
         * but <code>.</code> may be also used.
         */
        property: string
      }
    }) {

    const options = ((params || {}) as {
      download: {
        prompt: string
        name: string
        property: string
      }
    }).download
    const _prompt = options.prompt
    const _path = (options.property || '').replace(new RegExp('[.]', 'gi'), '/')
    const _root = property.findRoot()
    const _target = (_path && _root.getProperty(_path)) || _root

    const _create_file_name = (prop: FormProperty) => {
      const datePart = new Date().toLocaleString(/*'DE-de'*/)
        .replace(new RegExp('[.:/]', 'gi'), '-')
        .replace(', ', '_')
        .replace(' ', '_')
      return `${(prop.schema['title'] || prop.schema['name'] || 'Download')}-${datePart}.json`
    }
    const _download = (options.name) || _create_file_name(_target)

    const download = (mimeType, filename, text) => {
      const a = document.createElement('a')
      a.href = window.URL.createObjectURL(new Blob([text], {type: mimeType}))
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    const customFilename = _prompt ? prompt(_prompt, _download) : _download
    if (customFilename) {
      const value = JSON.stringify(_target.value, null, 2)
      download('application/json',
        customFilename + (!customFilename.toLowerCase().endsWith('.json') ? '.json' : ''),
        value)
    }
  }
}
