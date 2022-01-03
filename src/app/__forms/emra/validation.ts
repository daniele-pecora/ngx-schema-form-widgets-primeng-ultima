/*
 * define here the form validation
 */
import * as moment from 'moment'

export const validateAnfrage = (value, property, form_current) => {

  const error = validateGebGeschAnsch(value, property, form_current)
  if (error != null) {
    return error
  } else {
    return validateDateOfBirthParent(value, property, form_current)
  }

}

function validateGebGeschAnsch(value, property, form_current) {
  const form = form_current.findRoot()
  let geburt = ''
  let geschlecht = ''
  let adresse = ''
  if (form.properties['betroffener'] !== undefined) {
    if (form.properties['betroffener'].properties.geburt !== undefined) {
      geburt = form.properties['betroffener'].properties.geburt.value
    }
    if (form.properties['betroffener'].properties.geschlecht !== undefined) {
      geschlecht = form.properties['betroffener'].properties.geschlecht.value
    }

    if (form.properties['betroffener'].properties.anschrift !== undefined) {
      adresse = form.properties['betroffener'].properties.anschrift.value
    }
  }
  const valid = (geburt !== '' && geschlecht !== '') || adresse !== ''
  const message = `Geben Sie entweder 
A) Geschlecht und Geburtsdatum
oder 
B) Letzte bekannte Anschrift
ein.`

  if (!valid) {
    const error = {
      code: 'ONE_OF_PROPERTY',
      path: `#${property.path}`,
      message: message,
      params: [value],
      severity: 'info',
      title: 'Achtung:'
    }
    return error
  }
  return null
}

export const validateDateOfBirth = (value, property, form_current) => {

  if (moment(value, 'YYYY-MM-DD').isValid()) {
    if (moment(value, 'YYYY-MM-DD').isAfter(moment(new Date()))) {
      return createMessage(value, 'Geben Sie ein Datum in der Vergangenheit an.', property, form_current, true, 'DATE_IN_FUTURE')
    } else if (moment(value, 'YYYY-MM-DD').isBefore(moment('1900-01-01', 'YYYY-MM-DD'))) {
      return createMessage(value, 'Geben Sie ein Datum nachdem 01.01.1900 ein.', property, form_current, true, 'DATE_IN_PAST')
    }
  }
  return null
}

function validateDateOfBirthParent(value, property, form_current) {
  return validateDateOfBirth(value['geburt'], property, form_current)
}


function createMessage(value: string, message: string, property, form_current, isCard: boolean, errorCode: string) {
  const form = form_current.findRoot()
  // path to property for cards -> here its the birthday of each person (card)
  let __path;
  if (isCard) {
    __path = `#${property.path}`
  } else {
    __path = property.path
  }

  const error = {
    code: errorCode,
    path: __path,
    message: message ? message : `Das Datum ist nicht valide.`,
    params: [value]
  }

  const _error = Object.assign({
      __path, error
    },
    error
  )

  return error
}

export const validations = {
  '/betroffener': validateAnfrage,
  '/betroffener/geburt': validateDateOfBirth
};
