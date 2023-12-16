import React from "react";

export const LoginScreen: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="flex flex-col justify-center items-center w-96 h-96 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-800">Login</h1>
        <form className="flex flex-col justify-center items-center w-full">
          <input
            className="w-3/4 h-10 px-2 mt-4 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:shadow-md"
            type="text"
            placeholder="Email"
          />
          <input
            className="w-3/4 h-10 px-2 mt-4 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white focus:shadow-md"
            type="password"
            placeholder="Password"
          />
          <button
            className="w-3/4 h-10 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-700"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
