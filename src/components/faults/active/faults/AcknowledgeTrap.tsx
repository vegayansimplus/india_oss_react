// components/faults/active/AcknowledgeTrap.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useAppSelector } from '../../../../utils/customHooks/reactDataHooks';
import axiosClient from '../../../../utils/axiosData/axioxClient';
import { CLEAR_OR_ACK_ACTIVE_TRAP_API } from '../../../../utils/axiosData/apis';

export interface AcknowledgeTrapProps {
  selectedrows: Record<string, any>[];
  onDone?: () => void;
  useNetwork?: boolean;
}

/** ---------- helpers: robust selectors for your row keys ---------- */
const pick = (row: Record<string, any>, keys: string[]) => {
  for (const k of keys) {
    const v = row?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return undefined;
};

const getTrapId = (row: Record<string, any>) =>
  pick(row, ['__trapid', 'Internal TicketId', 'Trap Id', 'ID', 'trapid']);

const getAdapter = (row: Record<string, any>) =>
  pick(row, ['__adapaterName', 'Adapter', 'Adapter', 'adapaterName', 'adapterName']);

const getVendor = (row: Record<string, any>) =>
  pick(row, ['__vendor', 'Technology', 'Vendor', 'vendor']);

const getRecvTime = (row: Record<string, any>) =>
  pick(row, ['__rec_time', 'NMS Received Time', 'Received Time', 'rcvd_Time', 'rec_time']);

const getDeviceName = (row: Record<string, any>) =>
  pick(row, ['Device Name', 'Node Name', 'nodename', 'NodeName']) ?? '—';

/** ✅ NOW returns IST time string in format (YYYY-MM-DD HH:mm:ss) */
const nowStringIST = () => {
  const d = new Date();

  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = fmt.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');
  const second = get('second');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const TS_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const validTS = (s: string) => TS_REGEX.test(s);

/** ✅ Parse "YYYY-MM-DD HH:mm:ss" as IST (Asia/Kolkata) Date */
const toDateIST = (s?: string) => {
  if (!s || !validTS(s)) return undefined;
  const [datePart, timePart] = s.split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss] = timePart.split(':').map(Number);

  // Input string is IST (UTC+05:30) → convert to UTC millis
  const ms = Date.UTC(y, m - 1, d, hh - 5, mm - 30, ss); // Date.UTC normalizes automatically
  const dt = new Date(ms);
  return isNaN(dt.getTime()) ? undefined : dt;
};

/** ---------- component ---------- */
const AcknowledgeTrap: React.FC<AcknowledgeTrapProps> = ({
  selectedrows,
  onDone,
  useNetwork = true,
}) => {
  const total = useMemo(() => selectedrows?.length ?? 0, [selectedrows]);

  const [ackMsg, setAckMsg] = useState('Acknowledging trap');
  const [ackTime, setAckTime] = useState(nowStringIST()); // ✅ IST by default
  const [autoNow, setAutoNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // snackbars
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [snackType, setSnackType] =
    useState<'success' | 'error' | 'warning' | 'info'>('info');
  const notify = (
    msg: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ) => {
    setSnackText(msg);
    setSnackType(type);
    setSnackOpen(true);
  };

  // per-row status list
  const [results, setResults] = useState<
    Array<{ id: string; ok: boolean; msg: string }>
  >([]);

  const user = useAppSelector((state) => state.user.user);

  // auto time toggle (tick every second) — now IST
  useEffect(() => {
    if (!autoNow) return;
    const t = setInterval(() => setAckTime(nowStringIST()), 1000);
    return () => clearInterval(t);
  }, [autoNow]);

  const validateBeforeSubmit = (): boolean => {
    if (!total) {
      notify('Please select at least one trap.', 'error');
      return false;
    }
    if (!ackMsg.trim()) {
      notify('Acknowledge Message is required.', 'warning');
      return false;
    }
    if (!validTS(ackTime)) {
      notify('Invalid time format! Use YYYY-MM-DD HH:MM:SS', 'error');
      return false;
    }

    // sanity check against each row's rec_time (IST-based compare)
    const at = toDateIST(ackTime);
    for (const row of selectedrows) {
      const r = getRecvTime(row);
      if (r && validTS(r)) {
        const rt = toDateIST(r);
        if (at && rt && at < rt) {
          const id = getTrapId(row) ?? 'unknown';
          notify(
            `Ack time earlier than received for Trap ID ${id}. Fix the time and retry.`,
            'error',
          );
          return false;
        }
      }
    }
    return true;
  };

  const postAck = async (payload: any) => {
    const res = await axiosClient.post(CLEAR_OR_ACK_ACTIVE_TRAP_API, payload);
    if (res.status !== 200 && res.status !== 201)
      throw new Error(`HTTP ${res.status}`);
    return res.data;
  };

  const handleAcknowledge = async () => {
    if (!validateBeforeSubmit()) return;
    setSubmitting(true);
    setResults([]);

    // const username = user.userName || 'Guest';
    const username = 'Guest';
    let ok = 0;
    let fail = 0;

    for (const row of selectedrows) {
      const trapID = getTrapId(row);
      const adapaterName = getAdapter(row);
      const vendor = getVendor(row);

      if (!trapID || !adapaterName) {
        fail++;
        setResults((prev) => [
          ...prev,
          {
            id: trapID ?? 'unknown',
            ok: false,
            msg: 'Missing trapID or adapaterName. Skipped.',
          },
        ]);
        continue;
      }

      const payload = {
        trapID: trapID,
        ackFlag: 'ACK',
        ackUser: username,
        ackTime: ackTime,           // ✅ IST string
        ackMsg: ackMsg,
        adapaterName: adapaterName,
        dbinsertiontime: ackTime,   // ✅ IST string
        vendor: vendor,
      };

      console.log('ACK payload =>', payload);

      try {
        if (useNetwork) {
          await postAck(payload);
        }

        row['Ack Msg'] = ackMsg;
        row['Ack Time'] = ackTime;  // shown as IST
        row['Ack User'] = username;

        ok++;
        setResults((prev) => [
          ...prev,
          { id: trapID, ok: true, msg: 'Acknowledged' },
        ]);
      } catch (e: any) {
        console.error('ACK failed for Trap ID:', trapID, e);
        fail++;
        setResults((prev) => [
          ...prev,
          {
            id: trapID,
            ok: false,
            msg: e?.message ? String(e.message) : 'Request failed',
          },
        ]);
      }
    }

    if (ok && !fail)
      notify(`Acknowledged ${ok} trap(s) successfully.`, 'success');
    else if (ok && fail)
      notify(`Acknowledged ${ok}, failed ${fail}.`, 'warning');
    else notify('All acknowledge requests failed.', 'error');

    setSubmitting(false);
    if (ok && !fail) onDone?.();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Acknowledge Message"
            value={ackMsg}
            onChange={(e) => setAckMsg(e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 8 }}>
          <TextField
            label="Ack Time (YYYY-MM-DD HH:MM:SS)"
            value={ackTime}
            onChange={(e) => {
              setAckTime(e.target.value);
              setAutoNow(false);
            }}
            size="small"
            fullWidth
            error={!validTS(ackTime)}
            helperText={!validTS(ackTime) ? 'Use YYYY-MM-DD HH:MM:SS' : ' '}
          />
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ height: '40px' }}
            onClick={() => {
              setAckTime(nowStringIST()); // ✅ IST Now
              setAutoNow(true);
            }}
          >
            Use Current Time
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 0 }}>
        <Divider sx={{ my: 1 }} />
        <List
          dense
          sx={{
            maxHeight: 140,
            overflow: 'auto',
            border: '1px dashed #ddd',
            borderRadius: 1,
            p: 0,
          }}
        >
          {selectedrows.slice(0, 5).map((r, i) => {
            const id = getTrapId(r) ?? '—';
            const dev = getDeviceName(r);
            const recv = getRecvTime(r) ?? '—';
            const adapter = getAdapter(r) ?? '—';

            const warnTime =
              validTS(ackTime) && getRecvTime(r) && validTS(getRecvTime(r)!)
                ? (toDateIST(ackTime) as any) <
                  (toDateIST(getRecvTime(r)!) as any)
                : false;

            return (
              <ListItem key={`${id}-${i}`} divider sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        ID {id}
                      </Typography>
                      <Chip size="small" label={adapter} />
                    </Box>
                  }
                  secondary={
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography variant="caption">
                        Device: {dev}
                      </Typography>
                      <Typography variant="caption">
                        NMS Received: {recv}
                      </Typography>
                      {warnTime && (
                        <Tooltip title="Ack time is earlier than received time for this row">
                          <Chip
                            size="small"
                            color="error"
                            label="Time conflict"
                          />
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            );
          })}

          {selectedrows.length > 5 && (
            <ListItem>
              <Typography variant="caption">
                …and {selectedrows.length - 5} more
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button
          variant="contained"
          disabled={submitting || !total}
          onClick={handleAcknowledge}
        >
          {submitting
            ? 'Acknowledging…'
            : `Acknowledge ${total ? `(${total})` : ''}`}
        </Button>
        <Button
          variant="outlined"
          disabled={submitting}
          onClick={onDone}
        >
          Close
        </Button>
      </Box>

      {!!results.length && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Results
          </Typography>
          <List
            dense
            sx={{
              maxHeight: 140,
              overflow: 'auto',
              border: '1px dashed #eee',
              borderRadius: 1,
              p: 0,
            }}
          >
            {results.map((r, i) => (
              <ListItem key={`${r.id}-${i}`} divider sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        ID {r.id}
                      </Typography>
                      <Chip
                        size="small"
                        color={r.ok ? 'success' : 'error'}
                        label={r.ok ? 'OK' : 'FAILED'}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption">{r.msg}</Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={(_, r) =>
          r !== 'clickaway' && setSnackOpen(false)
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackType}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackText}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default AcknowledgeTrap;


