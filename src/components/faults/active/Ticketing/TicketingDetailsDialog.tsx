import { Button, Grid, Typography } from '@mui/material';
import { DynamicTableRow } from '../../../../store/types';
import CommonDialog from '../../../common/CommonDialog.';
interface TrapDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    popUpDataRow: DynamicTableRow | null;
}
function TicketingDetailsDialog({ open, onClose, popUpDataRow }: TrapDetailsDialogProps) {
    const commonSx3 = { fontFamily: 'inherit', fontSize: '0.8rem', textAlign: 'center',  };

    return (
        <CommonDialog open={open} onClose={onClose} title='Ticket Details' maxWidth="md">
            <hr />
            {popUpDataRow && (
                <>
                    <Grid container spacing={1} sx={{ paddingY: '1rem' }}>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Vegayan Ticket: <strong>{popUpDataRow["VegayanOSS Ticket"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                FreshService Ticket: <strong>{popUpDataRow["FS Ticket"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Ticket Status: <strong>{popUpDataRow["Ticket State"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Create Date: <strong>{popUpDataRow["OSS Ticket Created Time"]}</strong>
                            </Typography>
                        </Grid>
                    </Grid>
                    
                    <Grid container spacing={1} sx={{ paddingY: '1rem' }}>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Resolve Date: <strong>{popUpDataRow["OSS Ticket Resolution Time"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 4 }}>
                            <Typography sx={commonSx3}>
                                Last modify Date: <strong>{popUpDataRow["Last Modify Date"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                {/* Description: <strong>{popUpDataRow["Ticket Description"]}</strong> */}
                                Adapter: <strong>{popUpDataRow["Adapter"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 2 }}>
                            <Typography sx={commonSx3}>
                                Family: <strong>{popUpDataRow["Family"]}</strong>
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ paddingY: '1rem' }}>
                        <Grid size={{ md: 4 }}>
                            <Typography sx={commonSx3}>
                                {/* Adapter: <strong>{popUpDataRow["Adapter"]}</strong> */}
                                Description: <strong>{popUpDataRow["Ticket Description"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 2 }}>
                            <Typography sx={commonSx3}>
                                FreshService Error: <strong>{popUpDataRow["FS Error"]}</strong>
                            </Typography>
                        </Grid>
                        <Grid size={{ md: 3 }}>
                            <Typography sx={commonSx3}>
                                Backend processing Error: <strong>{popUpDataRow["Backend Error"]}</strong>
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* <Grid container spacing={1} sx={{ paddingY: '1rem' }}>
                        <Grid size={{ md: 12 }}>
                            <Typography sx={commonSx3}>
                                Internal TicketId: <strong>{popUpDataRow["Internal TicketId"]}</strong>
                            </Typography>
                        </Grid>
                    </Grid> */}
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
export default TicketingDetailsDialog;