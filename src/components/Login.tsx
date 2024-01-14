import React, { useState, useEffect } from 'react';
import { ToastContainer, ToastOptions, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { capitalCase } from 'change-case';
// import { Session } from '@supabase/supabase-js';
import supabase from '../supabaseClient';
import { userStore } from '../store/store';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<{ username: string; email: string; password: string }>({
    username: '',
    email: '',
    password: '',
  });

  const { currentUser, setUser, clearUser } = userStore()

  const clearErrors = () => {
    setErrors({
      username: '',
      email: '',
      password: '',
    });
  };

  const generateLoginToasts = (error: any) => {
    const errorFields = error.response?.data;

    const toastOptions: ToastOptions = {
      position: 'bottom-center',
      className: 'bg-error text-base-100',
      icon: '⚠️',
    };

    if (errorFields && Object.keys(errorFields).length > 0) {
      Object.keys(errorFields).forEach((k) => {
        if (k in errors) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [k]: errorFields[k].message,
          }));
        }
        const errorKey = k !== 'passwordConfirm' ? capitalCase(k) : '';
        errorKey &&
          toast.error(`${errorKey}: ${errorFields[k].message}`, toastOptions);
      });
    } else {
      toast.error(`${error.message}`, toastOptions);
    }
  };

  const login = async () => {
    clearErrors();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setUser(data.session)
      if (error) {
        throw error;
      }
    } catch (error) {
      generateLoginToasts(error);
    }
  };

  const signUp = async () => {
    clearErrors();
    try {

      // signUp will create a user entry in the auth schema which is secure
      // and is more difficult to pull data from/edit
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: username
          }
        }
      });

      if (authError) {
        throw authError;
      }

      console.log('User signed up:', data.user);

      // Create an entry in the public schema.
      const { error: userError } = await supabase.from('users').insert([
        { id: data.user!.id, userName: username }
      ]).select()

      if (userError) {
        throw userError;
      }

      // Automatically login after signing up
      await login();
    } catch (error) {
      generateLoginToasts(error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearUser()
  };



  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session)
    };

    fetchCurrentUser();
  }, []);

  return (
    <div>
      <ToastContainer />
      {currentUser ? (
        <p className="my-4">
          Signed in as <b>{currentUser.user.user_metadata.display_name}</b>
          <button onClick={signOut} className="italic opacity-40">
            (Log Out?)
          </button>
        </p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); }} className="mt-4 flex flex-col gap-y-2">
          <input
            id="username"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`textarea textarea-bordered flex-grow ${errors.username && 'textarea-error'
              }`}
          />
          {errors.username && (
            <label className="label pt-0" htmlFor="username">
              <span className="label-text-alt text-xs text-error">
                {errors.username}
              </span>
            </label>
          )}

          <input
            id="email"
            placeholder="Email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`textarea textarea-bordered flex-grow ${errors.email && 'textarea-error'
              }`}
          />
          {errors.username && (
            <label className="label pt-0" htmlFor="username">
              <span className="label-text-alt text-xs text-error">
                {errors.username}
              </span>
            </label>
          )}

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`textarea textarea-bordered flex-grow ${errors.password && 'textarea-error'
              }`}
          />
          {errors.password && (
            <label className="label pt-0" htmlFor="username">
              <span className="label-text-alt text-xs text-error">
                {errors.password}
              </span>
            </label>
          )}
          <button onClick={signUp} className="btn btn-secondary text-md">
            Sign Up
          </button>
          <button onClick={login} className="btn btn-neutral text-md">
            Login
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
