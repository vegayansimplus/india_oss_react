import * as React from 'react';
import { Box, SxProps } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// enable utc + timezone once
dayjs.extend(utc);
dayjs.extend(timezone);

const IST_TZ = 'Asia/Kolkata';

type Props = {
  fromDate: Date | null;
  toDate: Date | null;
  onChange: (next: { from: Date | null; to: Date | null }) => void;
  sx?: SxProps;
  format?: string; // optional format
  heightPx?: number; // optional height control
  fontRem?: number; // optional font control
};

const DateTimeRangeCompact: React.FC<Props> = ({
  fromDate,
  toDate,
  onChange,
  sx,
  format = 'YYYY/MM/DD HH:mm:ss', // 24-hr UI format
  heightPx = 20,
  fontRem = 0.8,
}) => {
  // JS Date -> Dayjs in IST for display
  const toIstDayjs = (d: Date | null): Dayjs | null =>
    d ? dayjs(d).tz(IST_TZ) : null;

  // High-specificity SX targets actual input
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      height: heightPx,
    },
    '& .MuiOutlinedInput-input, & .MuiInputBase-input, & input': {
      fontSize: `${fontRem}rem`,
      padding: '2px 6px',
      lineHeight: 1,
    },
    '& .MuiSvgIcon-root': { fontSize: '1rem' },
    '& .MuiIconButton-root': { padding: 0.25 },
  } as const;

  const labelSx = {
    fontSize: `${fontRem}rem`,
  } as const;

  const inlineInputStyle: React.CSSProperties = {
    fontSize: `${fontRem}rem`,
    padding: '1px 2px',
    lineHeight: 1,
  };

  // Common views + steps including seconds
  const views: readonly any[] = [
    'year',
    'month',
    'day',
    'hours',
    'minutes',
    'seconds',
  ];
  const timeSteps = { hours: 1, minutes: 1, seconds: 1 };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.5,
          alignItems: 'center',
          ...sx,
        }}
      >
        <DateTimePicker
          label="From (IST)"
          value={toIstDayjs(fromDate)}
          onChange={(v) =>
            onChange({
              from: v ? v.toDate() : null, // v already IST, Date = same instant
              to: toDate,
            })
          }
          format={format}
          timezone={IST_TZ}      // force IST UI
          views={views}
          timeSteps={timeSteps}
          ampm={false}           //  24-hr clock: 13, 14, 15...
          reduceAnimations
          slotProps={{
            textField: {
              size: 'small',
              InputProps: { sx: inputSx },
              InputLabelProps: { sx: labelSx },
              inputProps: { style: inlineInputStyle },
            },
            openPickerButton: { sx: { p: 0.25 } },
          }}
        />

        <DateTimePicker
          label="To (IST)"
          value={toIstDayjs(toDate)}
          onChange={(v) =>
            onChange({
              from: fromDate,
              to: v ? v.toDate() : null,
            })
          }
          format={format}
          timezone={IST_TZ}      // force IST UI
          views={views}
          timeSteps={timeSteps}
          ampm={false}           //  24-hr clock here too
          reduceAnimations
          slotProps={{
            textField: {
              size: 'small',
              InputProps: { sx: inputSx },
              InputLabelProps: { sx: labelSx },
              inputProps: { style: inlineInputStyle },
            },
            openPickerButton: { sx: { p: 0.25 } },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};
export default DateTimeRangeCompact;


