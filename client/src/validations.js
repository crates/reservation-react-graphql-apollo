// this could be used on the server as well
// but would require more setup.

import Yup from 'yup';

export const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required.')
    .min(3, 'Name is too short.')
    .max(40, 'Name is too long.'),
  hotelName: Yup.string().required('Hotel is required.'),
  arrivalDate: Yup.string().required('Check-in is required.'),
  departureDate: Yup.string().required('Check-out is required.'),
});

export async function validate(values) {
  let errors = [];
  try {
    await validationSchema.validate(values, {
      strict: true,
      abortEarly: false,
    });
    return {success: true};
  } catch (err) {
    if (err.name === 'ValidationError') {
      const {inner} = err;
      if (inner) {
        for (const e of inner) {
          errors = [...errors, ...e.errors];
        }
      }
    }
  }
  return {success: false, errors};
}
