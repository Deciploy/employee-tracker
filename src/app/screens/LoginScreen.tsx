import React from 'react';
import { Field, Form, Formik } from 'formik';
import { ErrorText } from './components/ErrorText';
import { VALIDATION_SCHEMAS } from '../config/constants';
import { AlertMessage } from './components/AlertMessage';
import axios from 'axios';
import { useAuth } from 'react-auth-utils';
import { useNavigate } from 'react-router';
import { Spinner } from './components/Spinner';

export const LoginScreen: React.FC = () => {
  const initialValues = {
    email: '',
    password: '',
  };

  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const submitHandler = (values: typeof initialValues) => {
    setLoading(true);
    setError('');
    axios
      .post('/auth/login/employee', values)
      .then((res) => {
        if (res?.data) {
          const { token, user } = res.data.data;
          const expireAt = new Date(token.expiration).getTime();

          signIn(token.token, expireAt, user);

          navigate('/');
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="flex flex-col justify-evenly items-center w-96 h-96 bg-white rounded-lg shadow-lg">
        <img
          className="h-12"
          src="https://res.cloudinary.com/deciploy/image/upload/v1721834904/deciploy/logo_dpfs8q.png"
          alt="logo"
        />
        <h1 className="text-2xl font-medium text-gray-800">Employee | Login</h1>
        <Formik
          initialValues={initialValues}
          onSubmit={submitHandler}
          validationSchema={VALIDATION_SCHEMAS.login}
        >
          {({ errors, touched }) => (
            <Form className="flex flex-col justify-center items-start w-3/4">
              <AlertMessage message={error} type="error" />
              <Field
                className={`w-full h-10 px-2 mt-4 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:shadow-md`}
                name="email"
                type="text"
                placeholder="Email"
              />
              <ErrorText
                visible={errors.email && touched.email}
                error={errors.email}
              />

              <Field
                className="w-full h-10 px-2 mt-4 text-secondary-700 bg-secondary-100 rounded-lg focus:outline-none focus:bg-white focus:shadow-md"
                type="password"
                name="password"
                placeholder="Password"
              />
              <ErrorText
                visible={errors.password && touched.password}
                error={errors.password}
              />

              <button
                className="w-full h-10 mt-4 text-white bg-primary-500 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-start justify-center gap-2">
                    <Spinner /> Logging...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
