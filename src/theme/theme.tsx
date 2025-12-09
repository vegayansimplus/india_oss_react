// import { createTheme } from "@mui/material";
// import type { Theme } from "@mui/material";
// import { useMemo } from "react";
// import { useAppSelector } from "../utils/customHooks/reactDataHooks";

// export const useReduxTheme = (): Theme => {
//   const mode = useAppSelector((state) => state.theme.mode);

//   const theme = useMemo(
//     () =>
//       createTheme({
//         palette: {
//           mode,
//           primary: {
//             main: "#990033", // Maroon
//             contrastText: "#ffffff", // white text on maroon buttons
//           },
//           secondary: {
//             main: "#ffcccb", // light pink as complementary
//             contrastText: "#000000",
//           },
//           ...(mode === "light"
//             ? {
//                 background: {
//                   default: "#fefefe",
//                   paper: "#ffffff",
//                 },
//                 text: {
//                   primary: "#000000",
//                   secondary: "#333333",
//                 },
//               }
//             : {
//                 background: {
//                   default: "#121212",
//                   paper: "#1e1e1e",
//                 },
//                 text: {
//                   primary: "#ffffff",
//                   secondary: "#cccccc",
//                 },
//               }),
//         },
//       }),
//     [mode]
//   );
//   return theme;
// };


// src/theme/useReduxTheme.ts
import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material";
import { useMemo } from "react";
import { useAppSelector } from "../utils/customHooks/reactDataHooks";

export const useReduxTheme = (): Theme => {
  const mode = useAppSelector((state) => state.theme.mode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            // main: "#990033", // Maroon  #004d40
            main: "#004d40", 
            contrastText: "#ffffff", // white text on maroon buttons
          },
          secondary: {
            main: "#ffcccb", // light pink
            contrastText: "#000000",
          },
          ...(mode === "light"
            ? {
                background: {
                  default: "#fefefe",
                  paper: "#ffffff",
                },
                text: {
                  primary: "#000000",
                  secondary: "#333333",
                },
              }
            : {
                background: {
                  default: "#121212",
                  paper: "#1e1e1e",
                },
                text: {
                  primary: "#ffffff",
                  secondary: "#cccccc",
                },
              }),
        },
        // breakpoints: {
        //   values: {
        //     xs: 0,
        //     sm: 600,
        //     md: 900,
        //     lg: 1200,
        //     xl: 1536,
        //   },
        // },
        typography: {
          fontFamily: "Roboto, sans-serif",
          h1: { fontSize: "2.5rem" },
          h2: { fontSize: "2rem" },
        },
        spacing: 8,
      }),
    [mode]
  );

  return theme;
};

