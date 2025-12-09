


// AddToFavContent.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, TextField, Autocomplete, Chip,
  Typography, Divider, Tooltip, CircularProgress, Snackbar, Alert,
  Grid,
} from '@mui/material';
import axiosClient from '../../../../utils/axiosData/axioxClient';
import {
  CREATE_OR_UPDATE_FAV_GROUP,
  DISTINCT_Adapter_LIST_API,
  DISTINCT_GROUP_TRAP_Adapter_LIST_API,
  DISTINCT_TRAP_TYPES_LIST_API,
} from '../../../../utils/axiosData/apis';

/** ---------- types & helpers ---------- */
export type IdLabel = { id: string; label: string };

type GroupTrap = {
  groupName: string;
  combinedTraptypes: string[];
  combinedAdapters: string[];
};

// 👇 NEW: payload type for onApplied to match the parent
export type ApplyPayload = {
  groupIds: string[];
  adapters: string[];
  trapTypes: string[];
};

export interface AddToFavContentProps {
  // (filters omitted for brevity)
  onApplied?: (payload: ApplyPayload) => void;   // 👈 CHANGED
  onCleared?: () => void;                        // 👈 usually no args
  // (rest omitted)
}

const mapIdLabel = (x: any, nameKey = 'name', idKey = 'id'): IdLabel => ({
  id: String(x?.[idKey] ?? x?.id ?? x?.value ?? x),
  label: String(x?.[nameKey] ?? x?.label ?? x?.toString?.() ?? x),
});

const toIdLabelsFromStrings = (arr: unknown): IdLabel[] =>
  Array.isArray(arr)
    ? (arr as unknown[])
        .filter((v) => typeof v === 'string' && v.trim().length > 0)
        .map((s: any) => ({ id: String(s), label: String(s) }))
    : [];

const uniqueSorted = (arr: string[]) =>
  Array.from(new Set(arr.filter(Boolean).map((s) => s.trim()))).sort();

const ensureOptionsContain = (opts: IdLabel[], neededIds: string[]): IdLabel[] => {
  const have = new Set(opts.map((o) => o.id));
  const missing = neededIds.filter((id) => !have.has(id)).map((id) => ({ id, label: id }));
  return [...opts, ...missing];
};

const csv = (items: IdLabel[]) => items.map((x) => x.id).join(',');

/** ---------- endpoints ---------- */
const API = {
  adapters: DISTINCT_Adapter_LIST_API,
  alarms: DISTINCT_TRAP_TYPES_LIST_API,
  groups: DISTINCT_GROUP_TRAP_Adapter_LIST_API,
  createOrUpdate: CREATE_OR_UPDATE_FAV_GROUP,
};

/** =======================================================================
 *  Component
 *  ======================================================================= */
const AddToFavContent: React.FC<AddToFavContentProps> = ({
  onApplied,
  onCleared,
}) => {
  const fieldSx = { width: '100%' };

  /** UI state */
  const [groupName, setGroupName] = useState('');
  const [adapterOptions, setAdapterOptions] = useState<IdLabel[]>([]);
  const [selAdapters, setSelAdapters] = useState<IdLabel[]>([]);
  const [alarmOptions, setAlarmOptions] = useState<IdLabel[]>([]);
  const [selAlarms, setSelAlarms] = useState<IdLabel[]>([]);
  const [groupOptions, setGroupOptions] = useState<IdLabel[]>([]);
  const [selGroups, setSelGroups] = useState<IdLabel[]>([]);

  /** keep raw groups for preview & edit load */
  const [groupsRaw, setGroupsRaw] = useState<GroupTrap[]>([]);

  /** loading flags */
  const [loadingAdapters, setLoadingAdapters] = useState(false);
  const [loadingAlarms, setLoadingAlarms] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);

  /** action busy flags */
  const [busySaveUpdate, setBusySaveUpdate] = useState(false);
  const [busyApply, setBusyApply] = useState(false);
  const [busyEdit, setBusyEdit] = useState(false);
  const [busyClear, setBusyClear] = useState(false);

  /** snack */
  const [snack, setSnack] = useState<{ open: boolean; msg: string; type: 'success' | 'error' | 'info' | 'warning' }>(
    { open: false, msg: '', type: 'info' }
  );
  const notify = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') =>
    setSnack({ open: true, msg, type });

  /** ========== loads ========== */
  useEffect(() => {
    const loadAdapters = async () => {
      setLoadingAdapters(true);

      try {
        const res = await axiosClient.get(`${API.adapters}`);
        const data = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        const opts = typeof data?.[0] === 'string'
          ? toIdLabelsFromStrings(data)
          : data.map((x: any) => mapIdLabel(x, 'name', 'id'));
        setAdapterOptions(opts);
      } catch {
        setAdapterOptions([]);
        notify('Failed to load adapters', 'error');
      } finally {
        setLoadingAdapters(false);
      }
    };
    loadAdapters();
  }, []);

  useEffect(() => {
    const loadAlarms = async () => {
       if(selAdapters.length===0) return;
      setAlarmOptions([]);
      setLoadingAlarms(true);
      try {
        const res = await axiosClient.get(`${API.alarms}`,{
          params:{
            selectedAdaptors: selAdapters.map(s=>s.label).join(',')
          }
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        const opts = typeof data?.[0] === 'string'
          ? toIdLabelsFromStrings(data)
          : data.map((x: any) => mapIdLabel(x, 'name', 'id'));
        setAlarmOptions(opts);
      } catch {
        setAlarmOptions([]);
        notify('Failed to load alarms', 'error');
      } finally {
        setLoadingAlarms(false);
      }
    };
    loadAlarms();
  }, [selAdapters]);

  useEffect(() => {
    const loadGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await axiosClient.get(`${API.groups}`);
        const data = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setGroupsRaw((data ?? []) as GroupTrap[]);
        setGroupOptions(
          (data as GroupTrap[]).filter((g) => g?.groupName).map((g) => ({ id: g.groupName, label: g.groupName }))
        );
      } catch {
        setGroupsRaw([]);
        setGroupOptions([]);
        notify('Failed to load groups', 'error');
      } finally {
        setLoadingGroups(false);
      }
    };
    loadGroups();
  }, []);

  /** ========== derived ========== */
  const canSaveOrUpdate = useMemo(
    () => groupName.trim().length > 0 && selAdapters.length > 0 && selAlarms.length > 0,
    [groupName, selAdapters, selAlarms]
  );

  const groupIndex = useMemo(() => {
    const m = new Map<string, GroupTrap>();
    for (const g of groupsRaw) m.set(g.groupName, g);
    return m;
  }, [groupsRaw]);

  const isUpdateMode = useMemo(() => groupIndex.has(groupName.trim()), [groupIndex, groupName]);

  const selectedGroupsAdapters = useMemo(() => {
    const all: string[] = [];
    for (const g of selGroups) {
      const hit = groupIndex.get(g.id);
      if (hit?.combinedAdapters?.length) all.push(...hit.combinedAdapters);
    }
    return uniqueSorted(all);
  }, [selGroups, groupIndex]);

  const selectedGroupsTraptypes = useMemo(() => {
    const all: string[] = [];
    for (const g of selGroups) {
      const hit = groupIndex.get(g.id);
      if (hit?.combinedTraptypes?.length) all.push(...hit.combinedTraptypes);
    }
    return uniqueSorted(all);
  }, [selGroups, groupIndex]);

  /** ========== editing helpers ========== */
  const populateFromGroup = (gName: string) => {
    const g = groupIndex.get(gName);
    if (!g) return;

    setAdapterOptions((opts) => ensureOptionsContain(opts, g.combinedAdapters ?? []));
    setAlarmOptions((opts) => ensureOptionsContain(opts, g.combinedTraptypes ?? []));
    setGroupName(g.groupName);
    setSelAdapters((g.combinedAdapters ?? []).map((id) => ({ id, label: id })));
    setSelAlarms((g.combinedTraptypes ?? []).map((id) => ({ id, label: id })));
  };

  /** ========== actions ========== */
  const handleSaveOrUpdate = async () => {
    if (!canSaveOrUpdate) return notify('Enter group name, and select at least one adapter & one alarm.', 'warning');
    setBusySaveUpdate(true);
    try {
      const adaptersCsv = csv(selAdapters);
      const alarmsCsv = csv(selAlarms);

      const payload = {
        groupName: groupName.trim(),
        adapters: adaptersCsv,
        trapTypes: alarmsCsv,
        action: isUpdateMode ? 'update' : 'create',
      };
      const response = await axiosClient.post(API.createOrUpdate, payload);
      if (response.status === 200) {
        notify('Group updated successfully', 'success');
      } else if (response.status === 201) {
        notify('Group created successfully', 'success');
      } else {
        notify('Something went wrong', 'warning');
      }
    } catch (e: any) {
      notify(e?.message ?? (isUpdateMode ? 'Update failed' : 'Save failed'), 'error');
    } finally {
      setBusySaveUpdate(false);
    }
  };

  // 👇 NOW sends ApplyPayload { groupIds, adapters, trapTypes }
  const handleApply = async () => {
    if (!selGroups.length) return notify('Select at least one group.', 'warning');
    setBusyApply(true);
    try {
      const groupIds = selGroups.map((g) => g.id);
      const adapters = selectedGroupsAdapters;
      const trapTypes = selectedGroupsTraptypes;

      onApplied?.({ groupIds, adapters, trapTypes });
      notify('Filter applied from selected group(s).', 'success');
    } catch (e: any) {
      notify(e?.message ?? 'Apply failed', 'error');
    } finally {
      setBusyApply(false);
    }
  };

  const handleEdit = async () => {
    if (!selGroups.length) return notify('Select at least one group to edit.', 'warning');
    setBusyEdit(true);
    try {
      populateFromGroup(selGroups[0].id);
    } finally {
      setBusyEdit(false);
    }
  };

  const handleClearGroup = async () => {
    if (!selGroups.length) return notify('Select at least one group to clear.', 'warning');
    setBusyClear(true);
    try {
      onCleared?.(); // parent restores all rows
      notify('Filter cleared.', 'success');
    } catch (e: any) {
      notify(e?.message ?? 'Clear failed', 'error');
    } finally {
      setBusyClear(false);
    }
  };

  /** ========== render ========== */
  return (
    <Box sx={{ p: 1, borderRadius: 1, bgcolor: '#fafafa' }}>
      <Box>
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid size={{xs:12,md:3}}>
            <TextField
              label="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              size="small"
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{xs:12,md:3}}>
            <Autocomplete
              multiple
              options={adapterOptions}
              value={selAdapters}
              onChange={(_, v) => setSelAdapters(v)}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              disableCloseOnSelect
              loading={loadingAdapters}
              size="small"
              getOptionLabel={(o) => o.label}
              renderTags={(value, getTagProps) =>
                value.map((opt, i) => (
                  <Chip key={opt.id} label={opt.label} size="small" {...getTagProps({ index: i })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Adapters"
                  placeholder="Select adapters"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingAdapters ? <CircularProgress size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={fieldSx}
                />
              )}
            />
          </Grid>

          <Grid size={{xs:12,md:4}}>
            <Autocomplete
              multiple
              options={alarmOptions}
              value={selAlarms}
              onChange={(_, v) => setSelAlarms(v)}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              disableCloseOnSelect
              loading={loadingAlarms}
              size="small"
              getOptionLabel={(o) => o.label}
              renderTags={(value, getTagProps) =>
                value.map((opt, i) => (
                  <Chip variant="outlined" key={opt.id} label={opt.label} size="small" {...getTagProps({ index: i })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Alarms"
                  placeholder="Select alarms"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingAlarms ? <CircularProgress size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={fieldSx}
                />
              )}
            />
          </Grid>

          <Grid size={{xs:12,md:2}} sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isUpdateMode ? 'Update existing group' : 'Create new group'}>
              <span>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSaveOrUpdate}
                  disabled={busySaveUpdate || !canSaveOrUpdate}
                  sx={{
                    backgroundColor: '#8a0037',
                    '&:hover': { backgroundColor: '#6c002b' },
                    minWidth: 100,
                    height: 36,
                  }}
                >
                  {busySaveUpdate ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : (isUpdateMode ? 'Update' : 'Save')}
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Row 2 — Groups multi-select + actions */}
        <Grid container spacing={1} alignItems="center">
          <Grid size={{xs:12,md:8}}>
            <Autocomplete
              multiple
              options={groupOptions}
              value={selGroups}
              onChange={(_, v) => setSelGroups(v)}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              disableCloseOnSelect
              loading={loadingGroups}
              size="small"
              getOptionLabel={(o) => o.label}
              renderTags={(value, getTagProps) =>
                value.map((opt, i) => (
                  <Chip key={opt.id} label={opt.label} size="small" {...getTagProps({ index: i })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Groups"
                  placeholder="Select groups"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingGroups ? <CircularProgress size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{xs:12,md:4}} sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={busyApply}
              sx={{ backgroundColor: '#8a0037', '&:hover': { backgroundColor: '#6c002b' }, height: 36 }}
            >
              {busyApply ? <CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> : null}
              Apply
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                if (!selGroups.length) return notify('Select at least one group to edit.', 'warning');
                setBusyEdit(true);
                try { populateFromGroup(selGroups[0].id); } finally { setBusyEdit(false); }
              }}
              disabled={busyEdit || !selGroups.length}
              sx={{ height: 36 }}
            >
              {busyEdit ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
              Edit
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (!selGroups.length) return notify('Select at least one group to clear.', 'warning');
                setBusyClear(true);
                try { onCleared?.(); notify('Filter cleared.', 'success'); } finally { setBusyClear(false); }
              }}
              disabled={busyClear}
              sx={{ height: 36 }}
            >
              {busyClear ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
              Clear
            </Button>
          </Grid>
        </Grid>

        {/* Row 3 — Preview based on selected groups */}
        <Grid size={{xs:12}} sx={{ mt: 1 }}>
          <Divider sx={{ my: 1 }} />

          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Selected Groups:</strong>{' '}
            {selGroups.length ? selGroups.map((g) => g.label).join(', ') : <em>None</em>}
          </Typography>

          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Adapters (from selected groups):</strong>{' '}
            {selectedGroupsAdapters.length ? selectedGroupsAdapters.join(', ') : <em>None</em>}
          </Typography>

          <Typography variant="body2">
            <strong>Trap Alarms (from selected groups):</strong>{' '}
            {selectedGroupsTraptypes.length ? selectedGroupsTraptypes.join(', ') : <em>None</em>}
          </Typography>
        </Grid>
      </Box>

      {/* snack */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={(_, r) => r !== 'clickaway' && setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddToFavContent;
