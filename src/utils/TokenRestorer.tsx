// import { useEffect } from "react";
// import { useLocation } from "react-router-dom";

// function TokenRestorer() {
//   const location = useLocation();

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const token = params.get("token");

//     if (token && !sessionStorage.getItem("token")) {
//       sessionStorage.setItem("token", token);
//     }
//   }, [location]);

//   return null;
// }

// export default TokenRestorer;

const TokenRestorer = () => {
  return null;
};

export default TokenRestorer;
