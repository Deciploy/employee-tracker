import * as Yup from "yup";

export const VALIDATION_SCHEMAS = {
  login: Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required("The email is required"),
    password: Yup.string().required("The password is required"),
  }),
};
