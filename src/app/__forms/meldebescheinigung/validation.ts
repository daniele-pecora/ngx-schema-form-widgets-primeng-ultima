/*
 * define here the form validation
 */
import * as moment from 'moment'

export const validateDateOfBirth = (value, property, form_current) => {

  // Date.parse() return the ms since 01.01.1970
  if (moment(value, 'YYYY-MM-DD').isValid()) {
    if (moment(value, 'YYYY-MM-DD').isAfter(moment(new Date()))) {
      const error = createMessage(value, "Geben Sie ein Datum in der Vergangenheit an.", property, form_current, true, 'DATE_IN_FUTURE');
      return error
    } else if (moment(value, 'YYYY-MM-DD').isBefore(moment('1900-01-01', 'YYYY-MM-DD'))) {
      const error = createMessage(value, "Geben Sie ein Datum nachdem 01.01.1900 ein.", property, form_current, true, 'DATE_IN_PAST');
      return error
    }
  }
  return null
};

export const validateDateOfBirthParent = (value, property, form_current) => {
  return validateDateOfBirth(value['geburt'], property, form_current)
};


function createMessage(value: string, message: string, property, form_current, isCard: boolean, errorCode: string) {
  const form = form_current.findRoot();
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
  };

  const _error = Object.assign({
      __path, error
    },
    error
  );
  return error
}


export const validations = {
  "/betroffener": validateDateOfBirthParent,
  "/betroffener/geburt": validateDateOfBirth
};
