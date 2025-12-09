import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { formatDateTime } from "../../utils/DateTimeFormatted";

const DateTimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(() =>
    formatDateTime(new Date())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Typography sx={{ fontSize: "1vw" }}>{currentTime}</Typography>;
};

export default DateTimeDisplay;
