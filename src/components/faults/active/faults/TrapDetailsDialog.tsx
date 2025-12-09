import { Button, Grid, Typography } from '@mui/material';

import { DynamicTableRow } from '../../../../store/types';
import CommonDialog from '../../../common/CommonDialog.';


interface TrapDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    popUpDataRow: DynamicTableRow | null;
}

function TrapDetailsDialog({ open, onClose, popUpDataRow }: TrapDetailsDialogProps) {
    const commonSx3 = { fontFamily: 'inherit', fontSize: '0.8rem', textAlign: 'center' };

    return (
        <CommonDialog open={open} onClose={onClose} title='Trap Details' maxWidth="md">
            <hr />
            {popUpDataRow && (
                <>
                    <Grid container spacing={1} sx={{ paddingY: '1rem' }}>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Adapter: <strong>{popUpDataRow["Adapter"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Severity: <strong>{popUpDataRow["Severity"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Alarm: <strong>{popUpDataRow["Alarm"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Client: <strong>{popUpDataRow["Client"]}</strong>
                            </Typography>
                        </Grid>
                    </Grid>
                    
                    <Grid container spacing={1} sx={{ paddingY: '1rem' }}>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Technology: <strong>{popUpDataRow["Technology"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Device Name: <strong>{popUpDataRow["Device Name"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Source: <strong>{popUpDataRow["Source"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Port Name: <strong>{popUpDataRow["Port Name"]}</strong>
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ paddingY: '1rem' }}>
                        <Grid size={{ md: 4 }}>
                            <Typography sx={commonSx3}>
                                Device Type: <strong>{popUpDataRow["Device Type"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 2 }}>
                            <Typography sx={commonSx3}>
                                NMS Received Time: <strong>{popUpDataRow["NMS Received Time"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Ack Status: <strong>{popUpDataRow["Ack Status"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Alarm Id: <strong>{popUpDataRow["Alarm Id"]}</strong>
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ paddingY: '1rem' }}>
                        <Grid size={{ md: 12 }}>
                            <Typography sx={commonSx3}>
                                Internal TicketId: <strong>{popUpDataRow["Internal TicketId"]}</strong>
                            </Typography>
                        </Grid>
                    </Grid>
                </>
            )}
            
            <Grid container spacing={1} sx={{ paddingY: '0.5rem' }}>
                <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                    <Button
                        sx={{ height: '1.8rem' }}
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </Grid>
            </Grid>
        </CommonDialog>
    );
}

export default TrapDetailsDialog;


