import React, { useMemo, useState } from 'react';
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

export interface ClearTrapProps {
  selectedrows: Record<string, any>[];
  onDone?: () => void;
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

/**
 * NOW returns IST time string in format: YYYY-MM-DD HH:mm:ss (Asia/Kolkata)
 */
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

/**
 * Parse "YYYY-MM-DD HH:mm:ss" as IST (Asia/Kolkata).
 * Internally convert to UTC-based Date, but interpret input as IST.
 */
const toDateIST = (s?: string) => {
  if (!s || !validTS(s)) return undefined;
  const [datePart, timePart] = s.split(' ');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss] = timePart.split(':').map(Number);

  // String represents IST (UTC+5:30), so convert to UTC
  const ms = Date.UTC(y, m - 1, d, hh - 5, mm - 30, ss); // normalize handled by Date.UTC
  const dt = new Date(ms);
  return isNaN(dt.getTime()) ? undefined : dt;
};

/** ---------- component ---------- */
const ClearTrap: React.FC<ClearTrapProps> = ({ selectedrows, onDone }) => {
  const total = useMemo(() => selectedrows?.length ?? 0, [selectedrows]);
  const [clearMsg, setClearMsg] = useState('Clearing trap');
  const [clearTime, setClearTime] = useState(nowStringIST()); // IST by default
  const [autoNow, setAutoNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // snackbars
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [snackType, setSnackType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const notify = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setSnackText(msg);
    setSnackType(type);
    setSnackOpen(true);
  };

  const [results, setResults] = useState<Array<{ id: string; ok: boolean; msg: string }>>([]);

  const user = useAppSelector((state) => state.user.user);

  // auto time toggle (IST now)
  React.useEffect(() => {
    if (!autoNow) return;
    const t = setInterval(() => setClearTime(nowStringIST()), 1000);
    return () => clearInterval(t);
  }, [autoNow]);

  const validateBeforeSubmit = (): boolean => {
    if (!total) {
      notify('Please select at least one trap.', 'error');
      return false;
    }
    if (!clearMsg.trim()) {
      notify('Clear Message is required.', 'warning');
      return false;
    }
    if (!validTS(clearTime)) {
      notify('Invalid time format! Use YYYY-MM-DD HH:MM:SS', 'error');
      return false;
    }

    // sanity check against each row's rec_time (IST-based comparison)
    const ct = toDateIST(clearTime);
    for (const row of selectedrows) {
      const r = getRecvTime(row);
      if (r && validTS(r)) {
        const rt = toDateIST(r);
        if (ct && rt && ct < rt) {
          const id = getTrapId(row) ?? 'unknown';
          notify(`Clear time earlier than received for Trap ID ${id}. Fix the time and retry.`, 'error');
          return false;
        }
      }
    }
    return true;
  };

  const handleClear = async () => {
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
          { id: trapID ?? 'unknown', ok: false, msg: 'Missing trapID or adapaterName. Skipped.' },
        ]);
        continue;
      }

      const payload = {
        trapID: trapID,
        ackFlag: 'CLEAR',
        ackUser: username,
        ackTime: clearTime,         // IST string goes to backend
        ackMsg: clearMsg,
        adapaterName: adapaterName,
        dbinsertiontime: clearTime, // IST
        vendor: vendor,
      };

      console.log(payload);

      try {
        const response = await axiosClient.post(CLEAR_OR_ACK_ACTIVE_TRAP_API, payload);
        console.log('Clear response for Trap ID:', trapID, response);

        if (response.status === 200) {
          row['Clear Msg'] = clearMsg;
          row['Clear Time'] = clearTime; // IST shown in preview/table
          row['Clear User'] = username;

          ok++;
          setResults((prev) => [...prev, { id: trapID, ok: true, msg: 'Cleared' }]);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (e: any) {
        console.error('Clear failed for Trap ID:', trapID, e);
        fail++;
        setResults((prev) => [
          ...prev,
          { id: trapID, ok: false, msg: e?.message ? String(e.message) : 'Request failed' },
        ]);
      }
    }

    if (ok && !fail) notify(`Cleared ${ok} trap(s) successfully.`, 'success');
    else if (ok && fail) notify(`Cleared ${ok}, failed ${fail}.`, 'warning');
    else notify('All clear requests failed.', 'error');

    setSubmitting(false);
    if (ok && !fail) onDone?.();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Grid container spacing={1} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Clear Message"
            value={clearMsg}
            onChange={(e) => setClearMsg(e.target.value)}
            size="small"
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 8 }}>
          <TextField
            label="Clear Time (YYYY-MM-DD HH:MM:SS)"
            value={clearTime}
            onChange={(e) => {
              setClearTime(e.target.value);
              setAutoNow(false);
            }}
            size="small"
            fullWidth
            error={!validTS(clearTime)}
            helperText={!validTS(clearTime) ? 'Use YYYY-MM-DD HH:MM:SS ' : ' '}
          />
        </Grid>

        <Grid size={{ xs: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ height: '40px' }}
            onClick={() => {
              setClearTime(nowStringIST()); // IST Now
              setAutoNow(true);
            }}
          >
            Use Current Time
          </Button>
        </Grid>

      </Grid>

      <Box sx={{ mt: 0 }}>
        <Divider sx={{ my: 1 }} />

        <List dense sx={{ maxHeight: 140, overflow: 'auto', border: '1px dashed #ddd', borderRadius: 1, p: 0 }}>
          {selectedrows.slice(0, 5).map((r, i) => {
            const id = getTrapId(r) ?? '—';
            const dev = getDeviceName(r);
            const recv = getRecvTime(r) ?? '—';
            const adapter = getAdapter(r) ?? '—';

            const warnTime =
              validTS(clearTime) && getRecvTime(r) && validTS(getRecvTime(r)!)
                ? (toDateIST(clearTime) as any) < (toDateIST(getRecvTime(r)!) as any)
                : false;

            return (
              <ListItem key={`${id}-${i}`} divider sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ID {id}
                      </Typography>
                      <Chip size="small" label={adapter} />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="caption">Device: {dev}</Typography>
                      <Typography variant="caption">NMS Received: {recv}</Typography>
                      {warnTime && (
                        <Tooltip title="Clear time is earlier than received time for this row">
                          <Chip size="small" color="error" label="Time conflict" />
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
              <Typography variant="caption">…and {selectedrows.length - 5} more</Typography>
            </ListItem>
          )}
        </List>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button variant="contained" disabled={submitting || !total} onClick={handleClear}>
          {submitting ? 'Clearing…' : `Clear ${total ? `(${total})` : ''}`}
        </Button>
        <Button variant="outlined" disabled={submitting}>
          Close
        </Button>
      </Box>

      {!!results.length && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Results
          </Typography>
          <List dense sx={{ maxHeight: 140, overflow: 'auto', border: '1px dashed #eee', borderRadius: 1, p: 0 }}>
            {results.map((r, i) => (
              <ListItem key={`${r.id}-${i}`} divider sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ID {r.id}
                      </Typography>
                      <Chip size="small" color={r.ok ? 'success' : 'error'} label={r.ok ? 'OK' : 'FAILED'} />
                    </Box>
                  }
                  secondary={<Typography variant="caption">{r.msg}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={(_, r) => r !== 'clickaway' && setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity={snackType} variant="filled" sx={{ width: '100%' }}>
          {snackText}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default ClearTrap;
