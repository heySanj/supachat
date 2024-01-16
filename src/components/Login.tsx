import React, { useState, useEffect } from "react";
import { ToastOptions, toast } from "react-toastify";
import supabase from "../supabaseClient";
import { userStore } from "../store/store";

import { useAutoAnimate } from "@formkit/auto-animate/react";

interface LoginProps {
  className: string;
}

const Login: React.FC<LoginProps> = ({ className }) => {
  const [animationParent] = useAutoAnimate();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formState, setFormState] = useState<{
    loggingIn: boolean;
    signingUp: boolean;
  }>({ loggingIn: false, signingUp: false });

  const { currentUser, setUser, clearUser } = userStore();
  const user = userStore();

  const generateLoginToasts = (error: any) => {
    const toastOptions: ToastOptions = {
      position: "bottom-center",
      className: "bg-error text-base-100",
      icon: "⚠️",
    };
    toast.error(`${error.message}`, toastOptions);
  };

  const login = async () => {
    if (!formState.loggingIn) {
      setFormState({ ...formState, loggingIn: true });
    } else {
      const { error } = await user.login(email, password);
      if (error) generateLoginToasts(error);
    }
  };

  const signUp = async () => {
    if (!formState.signingUp) {
      setFormState({ ...formState, signingUp: true });
    } else {
      try {
        // signUp will create a user entry in the auth schema which is secure
        // and is more difficult to pull data from/edit
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: username,
            },
          },
        });

        if (authError) {
          throw authError;
        }

        // Create an entry in the public schema.
        const { error: userError } = await supabase
          .from("users")
          .insert([{ id: data.user!.id, userName: username }])
          .select();

        if (userError) {
          throw userError;
        }

        // Automatically login after signing up
        await login();
      } catch (error) {
        generateLoginToasts(error);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearUser();
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session);
    };

    fetchCurrentUser();
  }, []);

  return (
    <div className={className}>
      {currentUser ? (
        <p className="my-4">
          Signed in as <b>{currentUser.user.user_metadata.display_name}</b>
          <button onClick={signOut} className="italic opacity-40">
            (Log Out?)
          </button>
        </p>
      ) : (
        <form
          ref={animationParent}
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="mt-4 flex flex-col gap-y-2"
        >
          {formState.signingUp && (
            <input
              id="username"
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`textarea textarea-bordered flex-grow`}
            />
          )}
          {(formState.loggingIn || formState.signingUp) && (
            <>
              <input
                id="email"
                placeholder="Email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`textarea textarea-bordered flex-grow`}
              />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`textarea textarea-bordered flex-grow`}
              />
            </>
          )}
          <div className="flex gap-x-2">
            {(formState.loggingIn || formState.signingUp) && (
              <button
                onClick={() => {
                  setFormState({ loggingIn: false, signingUp: false });
                }}
                className="btn btn-secondary text-md flex-shrink"
              >
                {`👈`}
              </button>
            )}

            {!formState.loggingIn && (
              <button
                onClick={signUp}
                className="btn btn-primary text-md flex-grow"
              >
                Sign Up
              </button>
            )}
            {!formState.signingUp && (
              <button
                onClick={login}
                className="btn btn-neutral text-md flex-grow"
              >
                Login
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
